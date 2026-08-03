import sys
import os
import time

sys.path.append(r"c:\Users\navee\Vanta-Studio\backend")
from services.b2_storage import b2_service

print("Scanning Backblaze B2 for orphaned assets to reconstruct projects.json...")
assets = b2_service.list_assets()

projects_map = {}
for asset in assets:
    p_name = asset.get("project_name")
    # Restore everything EXCEPT the Puma project as requested
    if p_name and p_name != "Puma Velocity Launch":
        if p_name not in projects_map:
            projects_map[p_name] = {
                "name": p_name,
                "created_at": asset.get("created_at", int(time.time())),
                "assets_count": 0
            }
        projects_map[p_name]["assets_count"] += 1

projects = list(projects_map.values())
projects.sort(key=lambda x: x["created_at"], reverse=True)

success = b2_service.save_projects(projects)
if success:
    print(f"SUCCESS: Restored {len(projects)} projects: {[p['name'] for p in projects]}")
else:
    print("FAILED to save restored projects.")
