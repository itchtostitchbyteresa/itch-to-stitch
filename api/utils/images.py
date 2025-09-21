from io import BytesIO
import requests
from PIL import Image, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

def fetch_image(url: str) -> Image.Image:
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return _rgba_to_rgb_over_white(Image.open(BytesIO(r.content)))

def read_upload(f) -> Image.Image:
    return _rgba_to_rgb_over_white(Image.open(BytesIO(f.file.read())))

def _rgba_to_rgb_over_white(img: Image.Image) -> Image.Image:
    if img.mode == "RGBA":
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, (0, 0), img)
        return bg.convert("RGB")
    return img.convert("RGB")

def resize_keep_ratio(img: Image.Image, max_size: int) -> Image.Image:
    w, h = img.size
    max_size = max(16, min(600, int(max_size)))
    if max(w, h) <= max_size:
        return img
    scale = max(w, h) / float(max_size)
    return img.resize((int(round(w / scale)), int(round(h / scale))), Image.NEAREST)
