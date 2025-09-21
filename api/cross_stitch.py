from io import BytesIO
import base64
import traceback
from typing import Optional, List, Dict, Tuple
from collections import deque, Counter

import requests
from PIL import Image, ImageFile, ImageDraw, ImageFont
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse

ImageFile.LOAD_TRUNCATED_IMAGES = True

from .palette_dmc import DMC, HAS_NUMPY, PALETTE_RGB

# Numpy is optional but strongly recommended (fast Lab math + cleanup)
try:
    import numpy as np
    HAS_NUMPY = True
except Exception:
    HAS_NUMPY = False

app = FastAPI()

# ----------------- DMC palette (yours, unchanged) -----------------

if HAS_NUMPY:
    PALETTE_RGB = np.array([[c["r"], c["g"], c["b"]] for c in DMC], dtype=np.uint8)

# ----------------- image helpers -----------------
def _fetch_image(url: str) -> Image.Image:
    r = requests.get(url, timeout=20)
    r.raise_for_status()
    im = Image.open(BytesIO(r.content))
    return _rgba_to_rgb_over_white(im)

def _read_upload(f: UploadFile) -> Image.Image:
    data = f.file.read()
    im = Image.open(BytesIO(data))
    return _rgba_to_rgb_over_white(im)

def _rgba_to_rgb_over_white(img: Image.Image) -> Image.Image:
    if img.mode == "RGBA":
        bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
        bg.paste(img, (0, 0), img)
        return bg.convert("RGB")
    return img.convert("RGB")

def _resize_keep_ratio(img: Image.Image, max_size: int) -> Image.Image:
    w, h = img.size
    max_size = max(16, min(600, int(max_size)))
    if max(w, h) <= max_size:
        return img
    scale = max(w, h) / float(max_size)
    new_w, new_h = int(round(w / scale)), int(round(h / scale))
    return img.resize((new_w, new_h), Image.NEAREST)

# ----------------- sRGB -> Lab (numpy + pure) -----------------
def _srgb_to_linear_np(c: np.ndarray) -> np.ndarray:
    a = 0.055
    return np.where(c <= 0.04045, c / 12.92, ((c + a) / (1 + a)) ** 2.4)

def _rgb_to_lab_np(rgb_u8: np.ndarray) -> np.ndarray:
    rgb = rgb_u8.astype(np.float32) / 255.0
    rgb_lin = _srgb_to_linear_np(rgb)
    M = np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ],
        dtype=np.float32,
    )
    xyz = np.tensordot(rgb_lin, M.T, axes=1) * 100.0
    Xn, Yn, Zn = 95.047, 100.0, 108.883
    x = xyz[..., 0] / Xn
    y = xyz[..., 1] / Yn
    z = xyz[..., 2] / Zn
    delta = 6 / 29
    def f(t):
        return np.where(t > delta**3, np.cbrt(t), t / (3 * delta**2) + 4 / 29)
    fx, fy, fz = f(x), f(y), f(z)
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)
    return np.stack([L, a, b], axis=-1).astype(np.float32)

def _srgb_to_linear_py(c: float) -> float:
    a = 0.055
    return c / 12.92 if c <= 0.04045 else ((c + a) / (1 + a)) ** 2.4

def _rgb_to_lab_py(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    r, g, b = [x / 255.0 for x in rgb]
    r, g, b = _srgb_to_linear_py(r), _srgb_to_linear_py(g), _srgb_to_linear_py(b)
    X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375
    Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750
    Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041
    X *= 100.0; Y *= 100.0; Z *= 100.0
    Xn, Yn, Zn = 95.047, 100.0, 108.883
    x = X / Xn; y = Y / Yn; z = Z / Zn
    delta = 6 / 29
    def f(t: float) -> float:
        return t ** (1/3) if t > delta**3 else (t / (3 * delta**2) + 4 / 29)
    fx, fy, fz = f(x), f(y), f(z)
    L = 116 * fy - 16
    a = 500 * (fx - fy)
    b = 200 * (fy - fz)
    return (L, a, b)

# ----------------- quantization (Lab distance + speckle cleanup) -----------------
def _map_palette_lab_numpy(img: Image.Image) -> Tuple[Image.Image, List[Dict], "np.ndarray"]:
    arr = np.array(img, dtype=np.uint8)  # H,W,3
    H, W, _ = arr.shape
    # compute Lab once
    img_lab = _rgb_to_lab_np(arr.reshape(-1, 3)).reshape(H, W, 3)
    palette_rgb = np.array([[c["r"], c["g"], c["b"]] for c in DMC], dtype=np.uint8)
    palette_lab = _rgb_to_lab_np(palette_rgb)
    # distances in Lab (ΔE76)
    # img_flat (N,1,3) vs pal (1,K,3) -> (N,K)
    img_flat = img_lab.reshape(-1, 3)
    pal_flat = palette_lab.reshape(1, -1, 3)
    diffs = img_flat[:, None, :] - pal_flat
    d2 = np.sum(diffs * diffs, axis=2)
    labels = d2.argmin(axis=1).astype(np.int32).reshape(H, W)

    # speckle cleanup: relabel tiny connected components to the majority neighbour
    labels = _speckle_cleanup_numpy(labels, min_size=4)

    # rebuild RGB and legend
    mapped = palette_rgb[labels]
    out_img = Image.fromarray(mapped.astype(np.uint8), mode="RGB")
    counts = np.bincount(labels.reshape(-1), minlength=len(DMC))
    used_idx = [i for i, c in enumerate(counts) if c > 0]
    legend = [{
        "code": DMC[i]["code"], "name": DMC[i]["name"],
        "r": int(DMC[i]["r"]), "g": int(DMC[i]["g"]), "b": int(DMC[i]["b"]),
        "count": int(counts[i]),
    } for i in used_idx]
    legend.sort(key=lambda x: x["count"], reverse=True)
    return out_img, legend, labels

def _speckle_cleanup_numpy(labels: "np.ndarray", min_size: int = 4) -> "np.ndarray":
    """
    Remove tiny islands (< min_size) using 4-neighbour connectivity.
    Reassign to the dominant colour in the border neighbours.
    """
    H, W = labels.shape
    lab = labels.copy()
    visited = np.zeros((H, W), dtype=bool)
    dirs = [(1,0), (-1,0), (0,1), (0,-1)]

    for y in range(H):
        for x in range(W):
            if visited[y, x]:
                continue
            color = lab[y, x]
            # flood fill to get component
            q = deque([(y, x)])
            visited[y, x] = True
            comp = [(y, x)]
            border_neigh = []
            while q:
                cy, cx = q.popleft()
                for dy, dx in dirs:
                    ny, nx = cy + dy, cx + dx
                    if ny < 0 or ny >= H or nx < 0 or nx >= W:
                        continue
                    if lab[ny, nx] == color and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))
                        comp.append((ny, nx))
                    elif lab[ny, nx] != color:
                        border_neigh.append(lab[ny, nx])

            if len(comp) < min_size and border_neigh:
                # majority neighbour colour
                target = Counter(border_neigh).most_common(1)[0][0]
                for (yy, xx) in comp:
                    lab[yy, xx] = target
    return lab

def _map_palette_lab_pure(img: Image.Image) -> Tuple[Image.Image, List[Dict], List[List[int]]]:
    # Pure-Python (no numpy): fine for small images (<= ~300 px max side)
    w, h = img.size
    pixels = list(img.getdata())
    # precompute palette Lab
    pal_rgb = [(c["r"], c["g"], c["b"]) for c in DMC]
    pal_lab = [_rgb_to_lab_py(rgb) for rgb in pal_rgb]

    labels: List[int] = []
    for (r, g, b) in pixels:
        L1, a1, b1 = _rgb_to_lab_py((r, g, b))
        best_i, best_d2 = 0, 10**9
        for i, (L2, a2, b2) in enumerate(pal_lab):
            dL = L1 - L2; da = a1 - a2; db = b1 - b2
            d2 = dL*dL + da*da + db*db
            if d2 < best_d2:
                best_d2 = d2; best_i = i
        labels.append(best_i)

    # reshape labels and cleanup speckles
    lab2d: List[List[int]] = [labels[i*w:(i+1)*w] for i in range(h)]
    lab2d = _speckle_cleanup_pure(lab2d, min_size=4)

    # rebuild RGB and legend
    mapped = [pal_rgb[idx] for row in lab2d for idx in row]
    out = Image.new("RGB", (w, h)); out.putdata(mapped)
    counts = Counter([idx for row in lab2d for idx in row])
    used_idx = [i for i, c in counts.items() if c > 0]
    legend = [{
        "code": DMC[i]["code"], "name": DMC[i]["name"],
        "r": pal_rgb[i][0], "g": pal_rgb[i][1], "b": pal_rgb[i][2],
        "count": int(counts[i]),
    } for i in used_idx]
    legend.sort(key=lambda x: x["count"], reverse=True)
    return out, legend, lab2d

def _speckle_cleanup_pure(labels: List[List[int]], min_size: int = 4) -> List[List[int]]:
    h = len(labels); w = len(labels[0]) if h else 0
    visited = [[False]*w for _ in range(h)]
    dirs = [(1,0), (-1,0), (0,1), (0,-1)]

    for y in range(h):
        for x in range(w):
            if visited[y][x]:
                continue
            color = labels[y][x]
            q = deque([(y, x)])
            visited[y][x] = True
            comp = [(y, x)]
            border_neigh = []
            while q:
                cy, cx = q.popleft()
                for dy, dx in dirs:
                    ny, nx = cy + dy, cx + dx
                    if ny < 0 or ny >= h or nx < 0 or nx >= w:
                        continue
                    if labels[ny][nx] == color and not visited[ny][nx]:
                        visited[ny][nx] = True
                        q.append((ny, nx))
                        comp.append((ny, nx))
                    elif labels[ny][nx] != color:
                        border_neigh.append(labels[ny][nx])

            if len(comp) < min_size and border_neigh:
                target = Counter(border_neigh).most_common(1)[0][0]
                for (yy, xx) in comp:
                    labels[yy][xx] = target
    return labels

# ----------------- chart rendering (unchanged UI) -----------------
SYMBOLS = list("X/\\+-•◇△#=%@~<>¶✚✕❖✱")  # cycles if needed

def _symbol(i: int) -> str:
    return SYMBOLS[i % len(SYMBOLS)]

def _font(px: int) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype("DejaVuSansMono.ttf", px)
    except Exception:
        return ImageFont.load_default()

def _tint(rgb: Tuple[int,int,int], amt: float = 0.22) -> Tuple[int,int,int]:
    r,g,b = rgb
    return (int(r+(255-r)*amt), int(g+(255-g)*amt), int(b+(255-b)*amt))

def _measure(drw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> Tuple[int,int]:
    try:
        l, t, r, b = drw.textbbox((0,0), text, font=font)
    except Exception:
        l, t, r, b = font.getbbox(text)
    return (r - l, b - t)

def render_chart(quantized: Image.Image, legend: List[Dict]) -> Image.Image:
    """Create a cross-stitch chart PNG: tinted squares + symbol + grid + legend."""
    w, h = quantized.size
    qpx = quantized.load()

    # Assign a stable symbol to each legend entry (ordered by count desc)
    for idx, item in enumerate(legend):
        item["symbol"] = _symbol(idx)

    # Map RGB to symbol for fast lookup
    rgb_to_sym: Dict[Tuple[int,int,int], str] = {}
    for it in legend:
        rgb_to_sym[(it["r"], it["g"], it["b"])] = it["symbol"]

    CELL = 20   # px per stitch cell
    PAD  = 30   # outer padding
    LEGEND_H = 48 + 22 * len(legend)

    W = PAD*2 + w*CELL
    H = PAD*2 + h*CELL + LEGEND_H
    img = Image.new("RGB", (W, H), (255, 255, 255))
    drw = ImageDraw.Draw(img)
    ftxt = _font(int(CELL*0.6))

    # fill squares
    for y in range(h):
        for x in range(w):
            rgb = qpx[x, y]
            x0 = PAD + x*CELL
            y0 = PAD + y*CELL
            drw.rectangle([x0, y0, x0+CELL, y0+CELL], fill=_tint(rgb, 0.22))

    # symbols
    for y in range(h):
        for x in range(w):
            rgb = qpx[x, y]
            sym = rgb_to_sym.get(rgb, "X")
            x0 = PAD + x*CELL + CELL//2
            y0 = PAD + y*CELL + CELL//2
            tw, th = _measure(drw, sym, ftxt)
            drw.text((x0 - tw/2, y0 - th/2 - 1), sym, fill=(0,0,0), font=ftxt)

    # grid: thin every cell, bold every 10
    thin = (200,200,200); bold = (140,140,140)
    for gx in range(w+1):
        X = PAD + gx*CELL
        drw.line([(X, PAD), (X, PAD + h*CELL)], fill=bold if gx % 10 == 0 else thin, width=1)
    for gy in range(h+1):
        Y = PAD + gy*CELL
        drw.line([(PAD, Y), (PAD + w*CELL, Y)], fill=bold if gy % 10 == 0 else thin, width=1)

    # legend
    lx = PAD
    ly = PAD + h*CELL + 24
    drw.text((lx, ly-20), "Legend (DMC)", fill=(0,0,0), font=_font(16))
    for i, u in enumerate(legend):
        yline = ly + i*22
        drw.rectangle([lx, yline, lx+18, yline+18], fill=(u["r"],u["g"],u["b"]), outline=(120,120,120))
        sbx = lx + 26
        drw.rectangle([sbx, yline, sbx+18, yline+18], fill=(255,255,255), outline=(120,120,120))
        drw.text((sbx+4, yline+1), u["symbol"], fill=(0,0,0), font=_font(16))
        drw.text((sbx+26, yline+2), f'{u["code"]} — {u["name"]}  ({u["count"]})', fill=(20,20,20), font=_font(16))

    return img

# ----------------- encode -----------------
def _png_b64(img: Image.Image) -> str:
    buf = BytesIO(); img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")

# ----------------- routes -----------------
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

        # --- NEW: Lab-based mapping + speckle cleanup (keeps full palette) ---
        if HAS_NUMPY:
            qimg, legend, _labels = _map_palette_lab_numpy(img)
        else:
            qimg, legend, _labels = _map_palette_lab_pure(img)

        chart = render_chart(qimg, legend)
        w_cells, h_cells = qimg.size

        return JSONResponse({
            "width": w_cells,
            "height": h_cells,
            "palette_used": legend,
            "image_png_base64": _png_b64(chart),
        })
    except Exception as e:
        return JSONResponse({"error": str(e), "trace": traceback.format_exc()}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.cross_stitch:app", host="0.0.0.0", port=8000, reload=True)

