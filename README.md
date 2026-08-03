<div align="center">
  <img src="logo.png" alt="Vanta Studio Logo" width="200" />
  <h1>Vanta Studio</h1>
  <p><b>Build the next generation of AI media apps. Generate with Genblaze. Store on Backblaze B2.</b></p>
  
  [![Hackathon](https://img.shields.io/badge/Hackathon-Backblaze_Generative_Media-red.svg)](https://devpost.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
</div>

<br/>

<div align="center">
  <a href="https://youtu.be/CVEa1z9pxds">
    <img src="https://img.youtube.com/vi/CVEa1z9pxds/maxresdefault.jpg" alt="Vanta Studio Demo Video" width="800" />
  </a>
  <p><i>👆 Click to watch the full demo on YouTube!</i></p>
</div>

---

## 💡 The Problem

Creative studios and marketers are rapidly adopting generative AI for their media pipelines, but the workflow is fragmented. Creators generate an image in Midjourney, a video in Runway, and audio in ElevenLabs. Downloading, organizing, and tracking the provenance (what prompt made this? which model version?) of these scattered assets across local hard drives is a nightmare. There is no centralized, production-minded vault that seamlessly connects the generation step to durable, organized storage.

## 🚀 The Solution: Vanta Studio

**Vanta Studio** is a centralized, multimodal generative AI workspace designed for professional production pipelines. 

By deeply integrating the **Genblaze SDK** for cross-provider media generation with **Backblaze B2** for immutable object storage, Vanta Studio allows creators to generate high-fidelity videos, images, 3D models, and audio inside a beautiful, project-based chat interface. The moment an asset is generated, it is automatically bundled with strict provenance metadata and permanently vaulted in the cloud.

![Vanta Studio UI](ui.png)

---

## 🔥 Proof of B2 and Genblaze Usage

Vanta Studio is built from the ground up around the Backblaze ecosystem:

### 1. Genblaze Orchestration
Vanta Studio uses the open-source **Genblaze** Python SDK to orchestrate the entire generative pipeline. When a user prompts a new asset (e.g., a video), the FastAPI backend passes the request through Genblaze. Genblaze acts as the unified middleware, routing the prompt to the appropriate foundational model (Runway, ElevenLabs, etc.), polling the asynchronous task endpoints, handling fallbacks, and downloading the raw bytes into memory.

### 2. Backblaze B2 Storage & Provenance
We use **Backblaze B2** as the absolute source of truth for the application. Our React frontend is entirely stateless. 
- **Raw Storage:** Once Genblaze returns the generated media, `boto3` streams the raw bytes directly into a B2 bucket organized by virtual project directories (`projects/ProjectName/assets/`).
- **Provenance Tracking:** We generate a strict JSON metadata file tracking the exact prompt, model version, timestamps, and generation IDs. This is uploaded alongside the media file in B2.
- **Dynamic Serving:** The frontend fetches the `projects.json` index and generates short-lived B2 pre-signed URLs on-the-fly to securely stream videos and render images directly from the cloud vault without proxying through the backend.

---

## 🧠 AI Providers and Models

We orchestrated a powerful suite of foundational models via Genblaze to achieve multimodal capabilities:

- **Runway Gen-3 Alpha Turbo (`gen4.5`)**: Orchestrated for rapid, high-fidelity text-to-video generation within the chat interface.
- **ElevenLabs (`eleven_monolingual_v1`)**: Used for hyper-realistic text-to-speech audio synthesis, leveraging specific voice profiles for cinematic voiceovers.
- **Tripo3D (`v3.1-20260211`)**: Integrated via asynchronous polling tasks for instantaneous text-to-3D GLB model generation.
- **Pollinations.ai (Stable Diffusion Flux-based)**: Harnessed for ultra-fast, zero-overhead 2D image prototyping and asset creation.

---

## 🏗️ Solution Architecture

![Architecture Diagram](architecture%20diagram.png)

Our architecture is designed for production readiness and high scalability:
1. **Frontend:** React + Vite handles the chat UI, project management, and asset gallery.
2. **Backend API:** A Python FastAPI server acts as the central router.
3. **Genblaze SDK:** Middleware that handles the complexities of 3rd-party AI API communication.
4. **Backblaze B2:** The durable object storage layer holding all media, metadata, and the global project index.

---

## 🛠️ Tech Stack

**Frontend:**
- React 19 + Vite
- Vanilla CSS (Custom Glassmorphism UI)
- Lucide React (Icons)

**Backend:**
- Python 3.12
- FastAPI & Uvicorn
- Genblaze SDK
- Boto3 (AWS SDK for S3-compatible B2 storage)
- HTTPX & Asyncio

**Cloud & Infrastructure:**
- Backblaze B2 Cloud Storage
- Render (Backend Hosting)
- Vercel (Frontend Hosting)

---

## ⚙️ Local Setup & Execution

Want to run Vanta Studio locally? 

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Backblaze B2 Bucket and Application Keys

### 1. Clone the repository
```bash
git clone https://github.com/Nexorax-nk/Vanta-Studio.git
cd Vanta-Studio
```

### 2. Setup the Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/Scripts/activate  # Or venv/bin/activate on Mac/Linux
pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory and add your keys:
```env
B2_KEY_ID="your_b2_key"
B2_APPLICATION_KEY="your_b2_app_key"
B2_BUCKET_NAME="your_bucket_name"
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"
RUNWAY_API_KEY="your_key"
ELEVENLABS_API_KEY="your_key"
TRIPO_API_KEY="your_key"
```
Start the server:
```bash
python -m uvicorn main:app --reload
```

### 3. Setup the Frontend (React)
Open a new terminal window:
```bash
cd frontend
npm install
```
Start the Vite dev server:
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to start generating!

---

## 🔮 What's Next?
- **Agentic Evaluation:** Using Genblaze to automatically evaluate generated media and re-prompt if the fidelity is low.
- **In-Browser Video Editing:** Allowing users to stitch together their generated B2 assets into a timeline directly in the browser.
- **Enterprise IAM:** Adding role-based access control to B2 vaults so teams can securely collaborate on agency projects.
