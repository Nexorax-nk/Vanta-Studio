import os
import httpx
import urllib.parse
import asyncio
from runwayml import AsyncRunwayML

class GenblazeOrchestrator:
    """
    Orchestrates generative media workflows. 
    In a full Genblaze integration, this wraps the Genblaze SDK pipelines.
    For this hackathon prototype without API keys, we are using a free open-source 
    image generation API (Pollinations.ai) as the provider.
    """
    def __init__(self):
        # We can still keep the keys around for when we add video later
        self.runway_key = os.getenv("RUNWAY_API_KEY")
        if self.runway_key and self.runway_key != "your_runway_api_key_here":
            self.runway_client = AsyncRunwayML(api_key=self.runway_key)
        else:
            self.runway_client = None
            
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        self.tripo_key = os.getenv("TRIPO_API_KEY")

    async def generate_3d(self, prompt: str) -> dict:
        """
        Orchestrates a 3D asset generation workflow using Tripo API.
        """
        if not self.tripo_key:
            raise ValueError("TRIPO_API_KEY is missing. Cannot generate 3D model.")

        headers = {
            "Authorization": f"Bearer {self.tripo_key}",
            "Content-Type": "application/json"
        }

        # 1. Start generation task
        payload = {
            "prompt": prompt,
            "model": "v3.1-20260211"
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://openapi.tripo3d.ai/v3/generation/text-to-model", headers=headers, json=payload, timeout=30.0)
            resp.raise_for_status()
            task_id = resp.json()["data"]["task_id"]

            # 2. Poll for completion
            while True:
                poll_resp = await client.get(f"https://openapi.tripo3d.ai/v3/tasks/{task_id}", headers=headers, timeout=30.0)
                poll_resp.raise_for_status()
                data = poll_resp.json()["data"]
                
                status = data["status"]
                if status == "success":
                    model_url = data["output"]["model_url"]
                    break
                elif status in ["failed", "cancelled", "unknown"]:
                    raise Exception(f"3D generation failed with status: {status}")
                
                await asyncio.sleep(2)

            # 3. Download the .glb file
            model_resp = await client.get(model_url, timeout=300.0)
            model_resp.raise_for_status()
            media_bytes = model_resp.content

        metadata = {
            "prompt": prompt,
            "provider": "Tripo",
            "model": "v3.1-20260211",
            "task_id": task_id,
            "source_url": model_url
        }

        return {
            "media_bytes": media_bytes,
            "metadata": metadata
        }

    async def generate_audio(self, prompt: str) -> dict:
        """
        Orchestrates an audio generation workflow using ElevenLabs.
        """
        if not self.elevenlabs_key:
            raise ValueError("ELEVENLABS_API_KEY is missing. Please connect your API key to generate audio.")

        # Using Rachel's voice ID
        voice_id = "21m00Tcm4TlvDq8ikWAM"
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

        headers = {
            "xi-api-key": self.elevenlabs_key,
            "Content-Type": "application/json"
        }

        payload = {
            "text": prompt,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=60.0)
                response.raise_for_status()
                media_bytes = response.content
        except Exception as e:
            raise ValueError(f"API Error: Please verify your API key and credits. Details: {str(e)}")

        metadata = {
            "prompt": prompt,
            "provider": "ElevenLabs",
            "model": "eleven_monolingual_v1",
            "voice_id": voice_id
        }

        return {
            "media_bytes": media_bytes,
            "metadata": metadata
        }

            
    async def generate_video(self, prompt: str) -> dict:
        """
        Orchestrates a video generation workflow using Runway Gen.
        """
        if not self.runway_client:
            raise ValueError("RUNWAY_API_KEY is missing. Please connect your API key to generate video.")

        try:
            # 1. Start generation task
            task = await self.runway_client.text_to_video.create(
                model='gen4.5',
                prompt_text=prompt,
                ratio='1280:720',
                duration=5
            )
            task_id = task.id

            # 2. Poll for completion
            while True:
                task_status = await self.runway_client.tasks.retrieve(task_id)
                if task_status.status in ['SUCCEEDED', 'FAILED']:
                    break
                await asyncio.sleep(5)

            if task_status.status == 'FAILED':
                raise Exception(f"Video generation failed: {task_status.failure_reason}")

            # Task output usually contains a list of URLs
            video_url = task_status.output[0]
            
            # 3. Download Media for B2 Storage
            async with httpx.AsyncClient() as client:
                vid_response = await client.get(video_url, timeout=300.0, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                vid_response.raise_for_status()
                media_bytes = vid_response.content

        except Exception as e:
            raise ValueError(f"API Error: Please verify your API key and credits. Details: {str(e)}")

        # 4. Construct Provenance Metadata
        metadata = {
            "prompt": prompt,
            "provider": "Runway",
            "model": "gen4.5",
            "task_id": task_id,
            "source_url": video_url
        }

        return {
            "media_bytes": media_bytes,
            "metadata": metadata
        }

    async def generate_image(self, prompt: str) -> dict:
        """
        Orchestrates an image generation workflow.
        1. Calls the free provider (Pollinations.ai).
        2. Downloads the raw media bytes.
        3. Returns the bytes and provenance metadata for storage.
        """
        # Encode the prompt for the URL
        encoded_prompt = urllib.parse.quote(prompt)
        # Using a seed to ensure uniqueness or caching bypass
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"

        async with httpx.AsyncClient() as client:
            # Download Media for B2 Storage
            img_response = await client.get(image_url, timeout=120.0)
            img_response.raise_for_status()
            media_bytes = img_response.content

            # Construct Provenance Metadata
            metadata = {
                "prompt": prompt,
                "provider": "Pollinations.ai (Free Model)",
                "model": "stable-diffusion-flux-based",
                "source_url": image_url
            }

            return {
                "media_bytes": media_bytes,
                "metadata": metadata
            }

genblaze_orchestrator = GenblazeOrchestrator()
