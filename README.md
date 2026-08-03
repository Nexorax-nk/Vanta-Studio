# Vanta Studio — The agentic creative workspace that transforms ideas into production-ready AI media

> **"Vanta Studio brings image, video, audio, and 3D generation into a single, unified environment backed by indestructible cloud storage."**

[![Backblaze Generative Media Hackathon](https://img.shields.io/badge/Hackathon-Backblaze%20Generative%20Media-d61521?style=flat-square)](#)
[![Powered by Genblaze](https://img.shields.io/badge/Powered%20by-Genblaze-8b5cf6?style=flat-square)](#use-of-genblaze)
[![Powered by Backblaze B2](https://img.shields.io/badge/Storage-Backblaze%20B2-0ea5e9?style=flat-square)](#b2-storage-and-data-orchestration)

---

## 🏆 Hackathon Judging Criteria

### 1. Real-World Utility
Creative professionals currently suffer from extreme fragmentation. You generate an image in Midjourney, animate it in Runway, create voiceovers in ElevenLabs, and construct 3D assets in Tripo3D. Your files are scattered across four different web apps, local folders, and chat histories. 

**Vanta Studio** solves this practical problem by providing a unified, chat-driven workspace. It orchestrates best-in-class AI models behind a single interface. Every asset generated is automatically tracked, metadata is preserved, and everything is seamlessly synced to a secure cloud vault.

### 2. Production Readiness
Vanta Studio is built on a modern, decoupled stack prioritizing speed and extensible AI integrations (React/Vite Frontend + FastAPI Python Backend). The UI is highly responsive, featuring custom media players (like a glowing, animated audio waveform player), skeleton loading states, and robust error handling. All heavy AI rendering tasks run asynchronously, ensuring the app functions reliably for real-world creative workflows beyond a simple demo.

### 3. B2 Storage and Data Orchestration
Generative media files (especially 4K video and 3D models) are massive. Vanta Studio solves this by using **Backblaze B2** as the absolute source of truth for the asset library. 

1. When Genblaze finishes generating an asset, the raw bytes are instantly uploaded to a Backblaze B2 Bucket (`Vanta-studio`).
2. Extensive provenance metadata (prompt, provider, timestamp, media type) is uploaded alongside the asset as a strict JSON file for auditable tracking.
3. A global `projects.json` index in B2 is updated in real-time.
4. The frontend React application remains completely stateless. It seamlessly fetches short-lived pre-signed URLs directly from the B2 Vault on-the-fly, allowing users to safely view, download, or bundle their generated assets into shareable `.zip` files directly from the cloud.

### 4. Use of Genblaze
Vanta Studio relies on a specialized **Genblaze Orchestrator** (`genblaze_client.py`) to route natural language prompts to the most capable models for the requested media type. The orchestrator translates the user's intent into API-specific payloads, manages long-polling and async webhooks for providers that require it (like Runway and Tripo3D), and standardizes the binary output so the frontend never has to worry about API-specific implementation details.

---

## 🧠 AI Providers & Models Used

| Media Type | Provider | Model |
|------------|----------|-------|
| **Image** | Pollinations.ai | Stable Diffusion / Flux based |
| **Video** | RunwayML | Gen-4.5 (`gen4.5`) |
| **Audio** | ElevenLabs | eleven_monolingual_v1 (Rachel) |
| **3D Model** | Tripo3D | v3.1-20260211 |

---

## 🚀 Setup & Execution

### Prerequisites
- Node.js v18+
- Python 3.11+

### Step 1: Clone and Install

```bash
git clone https://github.com/Nexorax-nk/Vanta-Studio.git
cd Vanta-Studio

# Install Backend
cd backend
pip install -r requirements.txt

# Install Frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and configure your API keys. *Note: Only B2 keys are strictly required to start the app. Image generation (via Pollinations) works without a key.*

```env
# Backblaze B2 Credentials
B2_KEY_ID="your_b2_key_id"
B2_APPLICATION_KEY="your_b2_application_key"
B2_BUCKET_NAME="your_bucket_name"
B2_ENDPOINT="https://s3.us-east-005.backblazeb2.com"

# AI Provider Credentials
RUNWAY_API_KEY="your_runway_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"
TRIPO_API_KEY="your_tripo_key"
```

### Step 3: Start the Studio

Run the backend (from the `backend` folder):
```bash
python -m uvicorn main:app --reload
```

Run the frontend (from the `frontend` folder):
```bash
npm run dev
```

Open **http://localhost:5173** in your browser to access Vanta Studio.

---

**Vanta Studio** | Backblaze Generative Media Hackathon | Team: Nexorax
