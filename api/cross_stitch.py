# Dev-safe FastAPI for local and Vercel
from io import BytesIO
import base64
import traceback
from typing import Optional, List, Dict

import requests
from PIL import Image, ImageFile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse

ImageFile.LOAD_TRUNCATED_IMAGES = True

try:
    import numpy as np
    HAS_NUMPY = True
except Exception:
    HAS_NUMPY = False

app = FastAPI()

# tiny starter palette (swap later)
DMC: List[Dict] = [
    {"code": "B5200", "name": "Snow White", "r": 255, "g": 255, "b": 255},
    {"code": "3865", "name": "Winter White", "r": 249, "g": 247, "b": 241},
    {"code": "3799", "name": "Pewter Gray Vy Dk", "r": 66, "g": 66, "b": 66},
    {"code": "310", "name": "Black", "r": 0, "g": 0, "b": 0},
    {"code": "321", "name": "Red", "r": 199, "g": 43, "b": 59},
    {"code": "666", "name": "Bright Red", "r": 227, "g": 29, "b": 66},
    {"code": "742", "name": "Tangerine Light", "r": 255, "g": 191, "b": 87},
    {"code": "704", "name": "Chartreuse Bright", "r": 158, "g": 207, "b": 52},
    {"code": "995", "name": "Electric Blue Dark", "r": 38, "g": 150, "b": 182},
]
if HAS_NUMPY:
    PALETTE_RGB = np.array([[c["r"], c["g"], c["b"]] for c in DMC], dtype=np.float32)

def _fetch_image(url: str) -> Image.Image:
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    return Image.open(BytesIO(r.content)).convert("RGB")

def _read_upload(f: UploadFile) -> Image.Image:
    data = f.file.read()
    return Image.open(BytesIO(data)).convert("RGB")

def _resize_keep_ratio(img: Image.Image, max_size: int) -> Image.Image:
    w, h = img.size
    max_size = max(16, min(600, int(max_size)))
    if max(w, h) <= max_size:
        return img
    scale = max(w, h) / float(max_size)
    new_w, new_h = int(round(w / scale)), int(round(h / scale))
    return img.resize((new_w, new_h), Image.NEAREST)

def _quantize_numpy(img: Image.Image):
    arr = np.array(img, dtype=np.float32)
    H, W, _ = arr.shape
    flat = arr.reshape(-1, 3)
    diffs = flat[:, None, :] - PALETTE_RGB[None, :, :]
    d2 = (diffs * diffs).sum(axis=2)
    labels = d2.argmin(axis=1).astype(np.int32)
    mapped = PALETTE_RGB[labels].reshape(H, W, 3).astype(np.uint8)
    out_img = Image.fromarray(mapped, mode="RGB")
    counts = np.bincount(labels, minlength=len(DMC))
    used_idx = [i for i, c in enumerate(counts) if c > 0]
    legend = [{
        "code": DMC[i]["code"], "name": DMC[i]["name"],
        "r": int(DMC[i]["r"]), "g": int(DMC[i]["g"]), "b": int(DMC[i]["b"]),
        "count": int(counts[i]),
    } for i in used_idx]
    legend.sort(key=lambda x: x["count"], reverse=True)
    return out_img, legend

def _quantize_pure(img: Image.Image):
    pixels = list(img.getdata())
    palette = [(c["r"], c["g"], c["b"]) for c in DMC]
    counts = [0] * len(palette)
    mapped = []
    for (r, g, b) in pixels:
        best_i = 0; best_d = 10**9
        for i, (pr, pg, pb) in enumerate(palette):
            dr = r - pr; dg = g - pg; db = b - pb
            d = dr*dr + dg*dg + db*db
            if d < best_d: best_d = d; best_i = i
        mapped.append(palette[best_i]); counts[best_i] += 1
    out = Image.new("RGB", img.size); out.putdata(mapped)
    legend = [{
        "code": DMC[i]["code"], "name": DMC[i]["name"],
        "r": palette[i][0], "g": palette[i][1], "b": palette[i][2],
        "count": counts[i],
    } for i in range(len(DMC)) if counts[i] > 0]
    legend.sort(key=lambda x: x["count"], reverse=True)
    return out, legend

def _png_b64(img: Image.Image) -> str:
    buf = BytesIO(); img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

@app.get("/api/cross_stitch")
def status():
    return {"ok": True, "numpy": HAS_NUMPY, "palette_len": len(DMC)}

@app.post("/api/cross_stitch")
async def cross_stitch(
    image_url: Optional[str] = Form(default=None),
    max_size: int = Form(default=150),
    image: Optional[UploadFile] = File(default=None),
):
    try:
        if not image_url and not image:
            return JSONResponse({"error": "Provide image_url or file upload 'image'."}, status_code=400)
        img = _read_upload(image) if image is not None else _fetch_image(image_url)
        img = _resize_keep_ratio(img, max_size)
        mapped, legend = (_quantize_numpy(img) if HAS_NUMPY else _quantize_pure(img))
        return JSONResponse({
            "width": mapped.size[0], "height": mapped.size[1],
            "palette_used": legend, "image_png_base64": _png_b64(mapped),
        })
    except Exception as e:
        return JSONResponse({"error": str(e), "trace": traceback.format_exc()}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.cross_stitch:app", host="0.0.0.0", port=8000, reload=True)
