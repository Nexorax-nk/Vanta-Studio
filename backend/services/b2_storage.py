import os
import json
import boto3
from botocore.config import Config
from dotenv import load_dotenv

# Load env variables
load_dotenv()

class B2StorageService:
    def __init__(self):
        self.endpoint = os.getenv("B2_ENDPOINT")
        self.key_id = os.getenv("B2_KEY_ID")
        self.application_key = os.getenv("B2_APPLICATION_KEY")
        self.bucket_name = os.getenv("B2_BUCKET_NAME")

        if not all([self.endpoint, self.key_id, self.application_key, self.bucket_name]):
            print("Warning: Missing Backblaze B2 environment variables. Ensure .env is populated.")
            self.s3_client = None
        else:
            self.s3_client = boto3.client(
                service_name='s3',
                endpoint_url=self.endpoint,
                aws_access_key_id=self.key_id,
                aws_secret_access_key=self.application_key,
                config=Config(signature_version='s3v4')
            )

    def upload_file_bytes(self, file_bytes: bytes, object_name: str, content_type: str = "application/octet-stream") -> str:
        """
        Uploads raw bytes to B2 and returns the public URL.
        """
        if not self.s3_client:
            return f"mock-url-for-{object_name}"

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=object_name,
            Body=file_bytes,
            ContentType=content_type
        )
        
        # Generate a pre-signed URL for the private bucket (valid for 24 hours)
        url = self.s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': object_name
            },
            ExpiresIn=86400
        )
        return url
        
    def upload_metadata(self, metadata_dict: dict, object_name: str) -> str:
        """
        Uploads provenance metadata JSON to B2.
        """
        metadata_bytes = json.dumps(metadata_dict, indent=2).encode('utf-8')
        return self.upload_file_bytes(metadata_bytes, object_name, content_type="application/json")

    def get_file_bytes(self, object_name: str) -> bytes:
        if not self.s3_client:
            return b""
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key=object_name)
            return response['Body'].read()
        except Exception as e:
            print(f"Error reading file bytes for {object_name}: {e}")
            return b""

    def get_projects(self) -> list:
        if not self.s3_client:
            return []
        try:
            response = self.s3_client.get_object(Bucket=self.bucket_name, Key="projects.json")
            data = response['Body'].read().decode('utf-8')
            return json.loads(data)
        except self.s3_client.exceptions.NoSuchKey:
            return []
        except Exception as e:
            print(f"Error reading projects: {e}")
            return []

    def save_projects(self, projects: list) -> bool:
        if not self.s3_client:
            return False
        try:
            metadata_bytes = json.dumps(projects, indent=2).encode('utf-8')
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key="projects.json",
                Body=metadata_bytes,
                ContentType="application/json"
            )
            return True
        except Exception as e:
            print(f"Error saving projects: {e}")
            return False

    def get_presigned_url(self, object_name: str) -> str:
        if not self.s3_client:
            return f"mock-url-for-{object_name}"
        return self.s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': self.bucket_name, 'Key': object_name},
            ExpiresIn=86400
        )

    def list_assets(self, project_name: str = None) -> list:
        if not self.s3_client:
            return []
        try:
            prefix = f"projects/{project_name}/assets/" if project_name else "projects/"
            # If no project_name provided, we can just list from all projects
            
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
            assets = []
            if 'Contents' in response:
                for item in response['Contents']:
                    if item['Key'].endswith('.json') and not item['Key'].endswith('projects.json'):
                        try:
                            meta_res = self.s3_client.get_object(Bucket=self.bucket_name, Key=item['Key'])
                            meta_data = json.loads(meta_res['Body'].read().decode('utf-8'))
                            
                            # Ensure media_url is up to date (presigned URLs expire)
                            # Let's see if metadata contains 'media_key' or we can infer it
                            # If we store 'media_key' in the metadata when generating, we can regenerate the url
                            if 'media_key' in meta_data:
                                meta_data['media_url'] = self.get_presigned_url(meta_data['media_key'])
                                
                            assets.append(meta_data)
                        except Exception as e:
                            print(f"Error reading asset metadata {item['Key']}: {e}")
            return assets
        except Exception as e:
            print(f"Error listing assets: {e}")
            return []

    def get_vault_stats(self) -> dict:
        if not self.s3_client:
            return {"storage_used": 0, "projects_count": 0, "recent_uploads": []}
            
        try:
            projects = self.get_projects()
            projects_count = len(projects)
            
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            total_size = 0
            objects = []
            
            if 'Contents' in response:
                for item in response['Contents']:
                    total_size += item['Size']
                    name = item['Key'].split('/')[-1]
                    if name: # skip empty folder keys
                        objects.append({
                            "name": name,
                            "size": item['Size'],
                            "last_modified": item['LastModified'].timestamp()
                        })
                    
            objects.sort(key=lambda x: x['last_modified'], reverse=True)
            recent_uploads = objects[:5]
            
            return {
                "storage_used": total_size,
                "projects_count": projects_count,
                "recent_uploads": recent_uploads
            }
            
        except Exception as e:
            print(f"Error getting vault stats: {e}")
            return {"storage_used": 0, "projects_count": 0, "recent_uploads": []}

b2_service = B2StorageService()
