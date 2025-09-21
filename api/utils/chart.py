from typing import Dict, Tuple, List
from PIL import Image, ImageDraw, ImageFont

SYMBOLS = list("X/\\+-•◇△#=%@~<>¶✚✕❖✱")

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

def _measure(drw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont):
    try:
        l, t, r, b = drw.textbbox((0,0), text, font=font)
    except Exception:
        l, t, r, b = font.getbbox(text)
    return (r - l, b - t)

def render_chart(quantized: Image.Image, legend: List[Dict]) -> Image.Image:
    w, h = quantized.size
    qpx = quantized.load()
    for idx, item in enumerate(legend):
        item["symbol"] = _symbol(idx)

    rgb_to_sym = {(u["r"], u["g"], u["b"]): u["symbol"] for u in legend}

    CELL, PAD = 20, 30
    LEGEND_H = 48 + 22 * len(legend)
    W = PAD*2 + w*CELL
    H = PAD*2 + h*CELL + LEGEND_H
    img = Image.new("RGB", (W, H), (255, 255, 255))
    drw = ImageDraw.Draw(img)
    ftxt = _font(int(CELL*0.6))

    # squares
    for y in range(h):
        for x in range(w):
            rgb = qpx[x, y]
            x0, y0 = PAD + x*CELL, PAD + y*CELL
            drw.rectangle([x0, y0, x0+CELL, y0+CELL], fill=_tint(rgb, 0.22))

    # symbols
    for y in range(h):
        for x in range(w):
            rgb = qpx[x, y]
            sym = rgb_to_sym.get(rgb, "X")
            x0, y0 = PAD + x*CELL + CELL//2, PAD + y*CELL + CELL//2
            tw, th = _measure(drw, sym, ftxt)
            drw.text((x0 - tw/2, y0 - th/2 - 1), sym, fill=(0,0,0), font=ftxt)

    # grid
    thin, bold = (200,200,200), (140,140,140)
    for gx in range(w+1):
        X = PAD + gx*CELL
        drw.line([(X, PAD), (X, PAD + h*CELL)], fill=bold if gx % 10 == 0 else thin, width=1)
    for gy in range(h+1):
        Y = PAD + gy*CELL
        drw.line([(PAD, Y), (PAD + w*CELL, Y)], fill=bold if gy % 10 == 0 else thin, width=1)

    # legend
    lx, ly = PAD, PAD + h*CELL + 24
    drw.text((lx, ly-20), "Legend (DMC)", fill=(0,0,0), font=_font(16))
    for i, u in enumerate(legend):
        yline = ly + i*22
        drw.rectangle([lx, yline, lx+18, yline+18], fill=(u["r"],u["g"],u["b"]), outline=(120,120,120))
        sbx = lx + 26
        drw.rectangle([sbx, yline, sbx+18, yline+18], fill=(255,255,255), outline=(120,120,120))
        drw.text((sbx+4, yline+1), u["symbol"], fill=(0,0,0), font=_font(16))
        drw.text((sbx+26, yline+2), f'{u["code"]} — {u["name"]}  ({u["count"]})', fill=(20,20,20), font=_font(16))
    return img
