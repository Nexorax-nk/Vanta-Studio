import inspect
from runwayml import RunwayML

client = RunwayML(api_key="dummy")
try:
    print(inspect.signature(client.image_to_video.create))
except Exception as e:
    print("image_to_video error:", e)

try:
    print(inspect.signature(client.text_to_video.create))
except Exception as e:
    print("text_to_video error:", e)
