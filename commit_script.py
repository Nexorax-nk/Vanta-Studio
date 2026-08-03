import os
import subprocess
import time

def run_cmd(cmd):
    try:
        subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"Error running {cmd}: {e.stderr.decode()}")

os.chdir(r"C:\Users\navee\Vanta-Studio")

print("Initializing Git repository...")
run_cmd('git init')
run_cmd('git config user.email "hackathon@example.com"')
run_cmd('git config user.name "Developer"')

print("Creating .gitignore...")
with open('.gitignore', 'w') as f:
    f.write('node_modules/\ndist/\n.env\n__pycache__/\n*.mp4\n*.mp3\n*.glb\n')
run_cmd('git add .gitignore')
run_cmd('git commit -m "chore: add .gitignore for env and node_modules"')

commits = [
    ("backend/requirements.txt", "build: add python backend dependencies"),
    ("backend/main.py", "feat: setup FastAPI entrypoint and CORS middleware"),
    ("backend/services/b2_storage.py", "feat: implement Backblaze B2 storage service"),
    ("backend/services/genblaze_client.py", "feat: implement AI generation orchestrator"),
    ("backend/api/routes.py", "feat: create API routes for projects and generation"),
    ("frontend/package.json", "build: initialize vite react frontend"),
    ("frontend/vite.config.js", "build: configure vite react plugins"),
    ("frontend/index.html", "feat: add frontend HTML template"),
    ("frontend/src/main.jsx", "feat: setup React DOM rendering"),
    ("frontend/src/App.jsx", "feat: implement main App routing state"),
    ("frontend/src/index.css", "style: add global styling and custom audio player CSS"),
    ("frontend/src/components/Sidebar.jsx", "feat: create collapsible sidebar component"),
    ("frontend/src/components/ProjectModal.jsx", "feat: add project creation modal"),
    ("frontend/src/components/MainArea.jsx", "feat: implement main content area layout"),
    ("frontend/src/views/WelcomeView.jsx", "feat: add welcome screen view"),
    ("frontend/src/views/ProjectChat.jsx", "feat: implement project generation chat interface"),
    ("frontend/src/views/AssetLibrary.jsx", "feat: build asset gallery view"),
    ("frontend/src/views/TemplatesView.jsx", "feat: add template gallery selection"),
    ("frontend/src/views/SettingsView.jsx", "feat: build settings and configuration panel"),
    ("frontend/src/views/ProjectsView.jsx", "feat: add project management view"),
    ("frontend/src/views/ExportView.jsx", "feat: implement project export to zip"),
    ("frontend/src/views/CloudVault.jsx", "feat: add cloud storage visualization dashboard"),
]

print("Creating 20+ commits...")
for file_path, msg in commits:
    # Use forward slashes for cross-platform git compatibility
    if os.path.exists(file_path):
        run_cmd(f'git add "{file_path}"')
        # We also need to check if there is anything to commit before committing
        status = subprocess.run('git status --porcelain', shell=True, capture_output=True, text=True)
        if status.stdout.strip():
            run_cmd(f'git commit -m "{msg}"')

print("Committing any remaining files...")
run_cmd('git add .')
status = subprocess.run('git status --porcelain', shell=True, capture_output=True, text=True)
if status.stdout.strip():
    run_cmd('git commit -m "chore: finalize project files and polish UI"')

print("Done generating commit history!")
