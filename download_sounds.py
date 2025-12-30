import requests
import os

sounds = [
    {
        "name": "quack.mp3",
        "url": "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9e3b7b.mp3"
    },
    {
        "name": "boing.mp3",
        "url": "https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b7b7.mp3"
    },
    {
        "name": "squeak.mp3",
        "url": "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9e3b7b.mp3"
    }
]

os.makedirs("sounds", exist_ok=True)

for sound in sounds:
    print(f"Downloading {sound['name']} from {sound['url']} ...")
    try:
        response = requests.get(sound["url"], timeout=15)
        response.raise_for_status()
        with open(os.path.join("sounds", sound["name"]), "wb") as f:
            f.write(response.content)
        print(f"Saved {sound['name']} to sounds/")
    except Exception as e:
        print(f"Failed to download {sound['name']}: {e}")
