# api/cross_stitch.py
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
import traceback

from .utils.images import fetch_image, read_upload, resize_keep_ratio
from .utils.quantize import map_palette_lab, HAS_NUMPY
from .utils.chart import render_chart
from .utils.encode import png_b64
from .palette_dmc import DMC

app = FastAPI()

@app.get("/api/cross_stitch")
def status():
    return {"ok": True, "numpy": HAS_NUMPY, "palette_len": len(DMC)}

@app.post("/api/cross_stitch")
async def cross_stitch(
    image_url: Optional[str] = Form(default=None),
    max_size: int = Form(default=100),
    image: Optional[UploadFile] = File(default=None),
):
    try:
        if not image_url and not image:
            return JSONResponse({"error": "Provide image_url or file upload 'image'."}, status_code=400)

        img = read_upload(image) if image is not None else fetch_image(image_url)
        img = resize_keep_ratio(img, max_size)

        qimg, legend, labels = map_palette_lab(img)
        chart = render_chart(qimg, legend)
        w_cells, h_cells = qimg.size
        labels_out = labels.tolist() if HAS_NUMPY else labels

        return JSONResponse({
            "width": w_cells,
            "height": h_cells,
            "palette_used": legend,      # includes stable "idx"
            "labels": labels_out,        # HxW DMC indices
            "image_png_base64": png_b64(chart),
        })
    except Exception as e:
        return JSONResponse({"error": str(e), "trace": traceback.format_exc()}, status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.cross_stitch:app", host="0.0.0.0", port=8000, reload=True)
