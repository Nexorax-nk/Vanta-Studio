import httpx
import asyncio

async def test():
    print("Sending generation request to local API...")
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post('http://localhost:8000/api/generate', json={'prompt': 'A beautiful glowing crystal on a pedestal, 4k, octane render', 'media_type': 'image'})
        print(f"Status Code: {r.status_code}")
        print("Response JSON:")
        import json
        print(json.dumps(r.json(), indent=2))

asyncio.run(test())
