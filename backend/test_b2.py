from services.b2_storage import b2_service

print("Testing B2 Upload...")
metadata = {
    "test_key": "test_value",
    "prompt": "Test from Vanta Studio backend setup!"
}

try:
    url = b2_service.upload_metadata(metadata_dict=metadata, object_name="metadata/test_upload.json")
    print(f"Success! File uploaded to: {url}")
except Exception as e:
    print(f"Failed to upload: {e}")
