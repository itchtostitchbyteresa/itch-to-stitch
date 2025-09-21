from typing import List, Dict
from collections import deque, Counter
from PIL import Image
try:
    import numpy as np
    HAS_NUMPY = True
except Exception:
    HAS_NUMPY = False
    np = None  # type: ignore

from .color import rgb_to_lab_tuple, rgb_to_lab_np, HAS_NUMPY as COLOR_HAS_NUMPY
from ..palette_dmc import DMC

HAS_NUMPY = HAS_NUMPY and COLOR_HAS_NUMPY  # single flag

def _speckle_cleanup(labels, min_size: int = 4):
    if HAS_NUMPY and isinstance(labels, np.ndarray):
        H, W = labels.shape
        visited = np.zeros((H, W), dtype=bool)
        lab = labels.copy()
        dirs = ((1,0), (-1,0), (0,1), (0,-1))
        for y in range(H):
            for x in range(W):
                if visited[y, x]:
                    continue
                color = lab[y, x]
                q = deque([(y, x)])
                visited[y, x] = True
                comp, border = [(y, x)], []
                while q:
                    cy, cx = q.popleft()
                    for dy, dx in dirs:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < H and 0 <= nx < W:
                            if lab[ny, nx] == color and not visited[ny, nx]:
                                visited[ny, nx] = True
                                q.append((ny, nx))
                                comp.append((ny, nx))
                            elif lab[ny, nx] != color:
                                border.append(lab[ny, nx])
                if len(comp) < min_size and border:
                    target = Counter(border).most_common(1)[0][0]
                    for (yy, xx) in comp:
                        lab[yy, xx] = target
        return lab
    else:
        h = len(labels); w = len(labels[0]) if h else 0
        visited = [[False]*w for _ in range(h)]
        dirs = ((1,0), (-1,0), (0,1), (0,-1))
        for y in range(h):
            for x in range(w):
                if visited[y][x]:
                    continue
                color = labels[y][x]
                q = deque([(y, x)])
                visited[y][x] = True
                comp, border = [(y, x)], []
                while q:
                    cy, cx = q.popleft()
                    for dy, dx in dirs:
                        ny, nx = cy + dy, cx + dx
                        if 0 <= ny < h and 0 <= nx < w:
                            if labels[ny][nx] == color and not visited[ny][nx]:
                                visited[ny][nx] = True
                                q.append((ny, nx))
                                comp.append((ny, nx))
                            elif labels[ny][nx] != color:
                                border.append(labels[ny][nx])
                if len(comp) < min_size and border:
                    target = Counter(border).most_common(1)[0][0]
                    for (yy, xx) in comp:
                        labels[yy][xx] = target
        return labels

def map_palette_lab(img: Image.Image):
    if HAS_NUMPY:
        arr = np.array(img, dtype=np.uint8)  # H,W,3
        H, W, _ = arr.shape
        img_lab = rgb_to_lab_np(arr.reshape(-1, 3)).reshape(H, W, 3)

        palette_rgb = np.array([[c["r"], c["g"], c["b"]] for c in DMC], dtype=np.uint8)
        palette_lab = rgb_to_lab_np(palette_rgb)

        diffs = img_lab.reshape(-1, 3)[:, None, :] - palette_lab.reshape(1, -1, 3)
        d2 = np.sum(diffs * diffs, axis=2)
        labels = d2.argmin(axis=1).astype(np.int32).reshape(H, W)

        labels = _speckle_cleanup(labels, min_size=4)
        mapped = palette_rgb[labels]
        out_img = Image.fromarray(mapped.astype(np.uint8), mode="RGB")

        counts = np.bincount(labels.reshape(-1), minlength=len(DMC))
        used_idx = [i for i, c in enumerate(counts) if c > 0]
        legend = [{
            "idx": i,
            "code": DMC[i]["code"], "name": DMC[i]["name"],
            "r": int(DMC[i]["r"]), "g": int(DMC[i]["g"]), "b": int(DMC[i]["b"]),
            "count": int(counts[i]),
        } for i in used_idx]
        legend.sort(key=lambda x: x["count"], reverse=True)
        return out_img, legend, labels
    else:
        w, h = img.size
        pixels = list(img.getdata())
        pal_rgb = [(c["r"], c["g"], c["b"]) for c in DMC]
        pal_lab = [rgb_to_lab_tuple(rgb) for rgb in pal_rgb]

        labels_flat = []
        for (r, g, b) in pixels:
            L1, a1, b1 = rgb_to_lab_tuple((r, g, b))
            best_i, best_d2 = 0, 10**9
            for i, (L2, a2, b2) in enumerate(pal_lab):
                d2 = (L1-L2)**2 + (a1-a2)**2 + (b1-b2)**2
                if d2 < best_d2:
                    best_d2, best_i = d2, i
            labels_flat.append(best_i)

        lab2d = [labels_flat[i*w:(i+1)*w] for i in range(h)]
        lab2d = _speckle_cleanup(lab2d, min_size=4)

        mapped = [pal_rgb[idx] for row in lab2d for idx in row]
        out = Image.new("RGB", (w, h)); out.putdata(mapped)

        from collections import Counter as C
        counts = C([idx for row in lab2d for idx in row])
        used_idx = [i for i, c in counts.items() if c > 0]
        legend = [{
            "idx": i,
            "code": DMC[i]["code"], "name": DMC[i]["name"],
            "r": pal_rgb[i][0], "g": pal_rgb[i][1], "b": pal_rgb[i][2],
            "count": int(counts[i]),
        } for i in used_idx]
        legend.sort(key=lambda x: x["count"], reverse=True)
        return out, legend, lab2d
