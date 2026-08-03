import time
import io
import json
import zipfile
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.genblaze_client import genblaze_orchestrator
from services.b2_storage import b2_service

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str

class GenerateRequest(BaseModel):
    prompt: str
    media_type: str = "image"
    project_name: str = "Uncategorized"

@router.get("/vault/stats")
async def get_vault_stats():
    return b2_service.get_vault_stats()

@router.get("/projects")
async def get_projects():
    return {"projects": b2_service.get_projects()}

@router.post("/projects")
async def create_project(req: ProjectCreate):
    projects = b2_service.get_projects()
    if any(p.get("name") == req.name for p in projects):
        return {"status": "exists", "project": req.name}
    
    new_project = {
        "name": req.name,
        "created_at": int(time.time()),
        "assets_count": 0
    }
    projects.insert(0, new_project)
    success = b2_service.save_projects(projects)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save project to B2")
    return new_project

@router.get("/projects/{project_name}/assets")
async def get_project_assets(project_name: str):
    assets = b2_service.list_assets(project_name)
    return {"assets": assets}

def create_project_zip(project_name: str) -> io.BytesIO:
    assets = b2_service.list_assets(project_name)
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        # Add metadata json
        zip_file.writestr("metadata.json", json.dumps({"project": project_name, "assets": assets}, indent=2))
        
        # Add each asset's media file
        for asset in assets:
            if "media_key" in asset:
                file_bytes = b2_service.get_file_bytes(asset["media_key"])
                if file_bytes:
                    file_name = asset["media_key"].split("/")[-1]
                    zip_file.writestr(f"media/{file_name}", file_bytes)
    
    zip_buffer.seek(0)
    return zip_buffer

@router.get("/projects/{project_name}/export/zip")
async def export_project_zip(project_name: str):
    zip_buffer = create_project_zip(project_name)
    return StreamingResponse(
        zip_buffer,
        media_type="application/x-zip-compressed",
        headers={"Content-Disposition": f"attachment; filename={project_name}_export.zip"}
    )

@router.get("/projects/{project_name}/export/share")
async def generate_shareable_link(project_name: str):
    zip_buffer = create_project_zip(project_name)
    
    timestamp = int(time.time())
    zip_key = f"projects/{project_name}/exports/shared_{timestamp}.zip"
    
    # Upload zip to B2
    media_url = b2_service.upload_file_bytes(
        file_bytes=zip_buffer.read(),
        object_name=zip_key,
        content_type="application/x-zip-compressed"
    )
    
    return {"url": media_url}

@router.get("/assets")
async def get_all_assets():
    assets = b2_service.list_assets()
    return {"assets": assets}

@router.post("/generate")
async def generate_media(req: GenerateRequest):
    if req.media_type not in ["image", "video", "audio", "3d"]:
        raise HTTPException(status_code=400, detail="Unsupported media_type. Must be 'image', 'video', 'audio', or '3d'.")

    try:
        # 1. Orchestrate Generation
        if req.media_type == "video":
            gen_result = await genblaze_orchestrator.generate_video(req.prompt)
            content_type = "video/mp4"
            ext = "mp4"
        elif req.media_type == "audio":
            gen_result = await genblaze_orchestrator.generate_audio(req.prompt)
            content_type = "audio/mpeg"
            ext = "mp3"
        elif req.media_type == "3d":
            gen_result = await genblaze_orchestrator.generate_3d(req.prompt)
            content_type = "model/gltf-binary"
            ext = "glb"
        else:
            gen_result = await genblaze_orchestrator.generate_image(req.prompt)
            content_type = "image/png"
            ext = "png"
        
        media_bytes = gen_result["media_bytes"]
        metadata = gen_result["metadata"]
        
        timestamp = int(time.time())
        base_name = f"generation_{timestamp}"
        
        media_key = f"projects/{req.project_name}/assets/{base_name}.{ext}"
        metadata_key = f"projects/{req.project_name}/assets/{base_name}.json"
        
        # Add keys to metadata
        metadata["media_key"] = media_key
        metadata["project_name"] = req.project_name
        metadata["created_at"] = timestamp
        metadata["media_type"] = req.media_type
        
        # 2. Upload Media to Backblaze B2
        media_url = b2_service.upload_file_bytes(
            file_bytes=media_bytes,
            object_name=media_key,
            content_type=content_type
        )
        
        metadata["media_url"] = media_url
        
        # 3. Upload Provenance Metadata to Backblaze B2
        metadata_url = b2_service.upload_metadata(
            metadata_dict=metadata,
            object_name=metadata_key
        )
        
        return {
            "status": "success",
            "media_url": media_url,
            "metadata_url": metadata_url,
            "provenance": metadata
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
