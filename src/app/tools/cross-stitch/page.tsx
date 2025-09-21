"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import { Header } from "@/components/Header";

type LegendItem = {
  idx: number;       // DMC index, stable
  code: string;
  name: string;
  r: number; g: number; b: number;
  count: number;
};

type ApiOk = {
  width: number;
  height: number;
  image_png_base64: string; // data URL of rendered chart (server)
  labels: number[][];       // HxW, each is a DMC index
  palette_used: LegendItem[];
};
type ApiErr = { error: string; trace?: string };
type ApiResult = ApiOk | ApiErr;

// same symbol set as backend
const SYMBOLS = ['X','/','\\','+','-','•','◇','△','#','=','%','@','~','<','>','¶','✚','✕','❖','✱'];

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [maxSizeStr, setMaxSizeStr] = useState<string>("150");
  const [showGrid, setShowGrid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiOk | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [grid, setGrid] = useState<number[][] | null>(null); // editable labels
  const [currentColor, setCurrentColor] = useState<number | null>(null); // DMC idx
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ----- helpers -----
  function clampMaxSize(n: number) {
    if (!Number.isFinite(n)) return 150;
    return Math.max(16, Math.min(300, Math.round(n)));
  }
  function normalizedMaxSize(): number {
    const n = parseInt(maxSizeStr, 10);
    return clampMaxSize(Number.isNaN(n) ? 150 : n);
  }
  function onFileChange(f: File | null) {
    setError(null);
    setData(null);
    setGrid(null);
    if (!f) {
      setFile(null);
      return;
    }
    // Client-side file cap: 3 MB
    const MAX_BYTES = 3 * 1024 * 1024;
    if (f.size > MAX_BYTES) {
      setFile(null);
      setError("That file is over 3 MB. Try a smaller image or reduce dimensions.");
      return;
    }
    setFile(f);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setData(null);
    setGrid(null);
    setCurrentColor(null);

    try {
      const fd = new FormData();
      fd.append("max_size", String(normalizedMaxSize()));
      fd.append("image", file);

      const res = await fetch("/api/cross_stitch", { method: "POST", body: fd });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${txt.slice(0, 160)}`);
      }
      const json: ApiResult = await res.json();
      if (!res.ok || "error" in json) throw new Error(("error" in json ? json.error : `HTTP ${res.status}`));

      setData(json);
      // clone labels into editable grid
      setGrid(json.labels.map(row => row.slice()));
      // pick the most common color as default brush
      const defaultIdx = (json.palette_used[0]?.idx ?? null);
      setCurrentColor(defaultIdx);
    } catch (err: unknown) {
      let msg = "Something went wrong";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "string") msg = err;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Local preview URL for uploaded file
  const filePreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  // ----- Editor drawing -----
  const CELL = 18; // px per cell in the editor canvas
  const DPR = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;

  // Map from DMC idx -> info / color
  const paletteMap = useMemo(() => {
    const m = new Map<number, LegendItem>();
    if (data) {
      for (const p of data.palette_used) m.set(p.idx, p);
    }
    return m;
  }, [data]);

  const colorMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of paletteMap.values()) {
      m.set(p.idx, `rgb(${p.r}, ${p.g}, ${p.b})`);
    }
    return m;
  }, [paletteMap]);

  useEffect(() => {
    if (!data || !grid || !canvasRef.current) return;
    const { width: W, height: H } = data;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cssW = W * CELL;
    const cssH = H * CELL;
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // fill background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssW, cssH);

    // draw cells
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = grid[y][x];
        const col = colorMap.get(idx) || "rgb(0,0,0)";
        ctx.fillStyle = col;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }

    // grid overlay (thin lines every cell, bold every 10)
    if (showGrid) {
      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      for (let gx = 0; gx <= W; gx++) {
        ctx.beginPath();
        ctx.moveTo(gx * CELL + 0.5, 0);
        ctx.lineTo(gx * CELL + 0.5, cssH);
        ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy++) {
        ctx.beginPath();
        ctx.moveTo(0, gy * CELL + 0.5);
        ctx.lineTo(cssW, gy * CELL + 0.5);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      for (let gx = 0; gx <= W; gx += 10) {
        ctx.beginPath();
        ctx.moveTo(gx * CELL + 0.5, 0);
        ctx.lineTo(gx * CELL + 0.5, cssH);
        ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy += 10) {
        ctx.beginPath();
        ctx.moveTo(0, gy * CELL + 0.5);
        ctx.lineTo(cssW, gy * CELL + 0.5);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [data, grid, colorMap, showGrid]);

  // Click to paint
  function onCanvasClick(evt: React.MouseEvent<HTMLCanvasElement>) {
    if (!data || !grid || currentColor == null) return;
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    const x = Math.floor((evt.clientX - rect.left) / CELL);
    const y = Math.floor((evt.clientY - rect.top) / CELL);
    if (x < 0 || y < 0 || x >= data.width || y >= data.height) return;
    setGrid(prev => {
      if (!prev) return prev;
      const next = prev.map(row => row.slice());
      next[y][x] = currentColor;
      return next;
    });
  }

  // ---- Chart-style export (tinted squares + symbols + legend) ----
  function tint([r, g, b]: [number, number, number], amt = 0.22): string {
    const tr = Math.round(r + (255 - r) * amt);
    const tg = Math.round(g + (255 - g) * amt);
    const tb = Math.round(b + (255 - b) * amt);
    return `rgb(${tr}, ${tg}, ${tb})`;
  }

  function buildLegendFromGrid(g: number[][]): Array<{ idx: number; count: number; r: number; g: number; b: number; code: string; name: string; symbol?: string; }> {
    if (!data) return [];
    const counts = new Map<number, number>();
    for (const row of g) for (const v of row) counts.set(v, (counts.get(v) || 0) + 1);
    const items: Array<{ idx: number; count: number; r: number; g: number; b: number; code: string; name: string; symbol?: string; }> = [];
    for (const [idx, count] of counts.entries()) {
      const p = paletteMap.get(idx);
      if (!p) continue;
      items.push({ idx, count, r: p.r, g: p.g, b: p.b, code: p.code, name: p.name });
    }
    // order by count desc
    items.sort((a, b) => b.count - a.count);
    // assign symbols
    for (let i = 0; i < items.length; i++) items[i].symbol = SYMBOLS[i % SYMBOLS.length];
    return items;
  }

  function downloadEditedChart() {
    if (!data || !grid) return;

    const W = data.width;
    const H = data.height;
    const CELL = 20; // chart cell size (slightly larger than editor)
    const PAD = 30;
    const legendItems = buildLegendFromGrid(grid);

    const LEGEND_H = 48 + 22 * legendItems.length;
    const CSS_W = PAD * 2 + W * CELL;
    const CSS_H = PAD * 2 + H * CELL + LEGEND_H;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const canvas = document.createElement("canvas");
    canvas.style.width = `${CSS_W}px`;
    canvas.style.height = `${CSS_H}px`;
    canvas.width = Math.floor(CSS_W * DPR);
    canvas.height = Math.floor(CSS_H * DPR);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CSS_W, CSS_H);

    // squares (tinted)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = grid[y][x];
        const p = paletteMap.get(idx);
        if (!p) continue;
        ctx.fillStyle = tint([p.r, p.g, p.b], 0.22);
        const x0 = PAD + x * CELL;
        const y0 = PAD + y * CELL;
        ctx.fillRect(x0, y0, CELL, CELL);
      }
    }

    // symbols
    ctx.fillStyle = "#000";
    ctx.font = `${Math.floor(CELL * 0.6)}px monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // quick map: rgb -> symbol from legend
    const rgbKey = (r: number, g: number, b: number) => `${r},${g},${b}`;
    const rgbToSymbol = new Map<string, string>();
    for (const u of legendItems) rgbToSymbol.set(rgbKey(u.r, u.g, u.b), u.symbol!);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = grid[y][x];
        const p = paletteMap.get(idx);
        if (!p) continue;
        const sym = rgbToSymbol.get(rgbKey(p.r, p.g, p.b)) || "X";
        const cx = PAD + x * CELL + CELL / 2;
        const cy = PAD + y * CELL + CELL / 2 - 1;
        ctx.fillText(sym, cx, cy);
      }
    }

    // grid: thin every cell, bold every 10
    const thin = "rgb(200,200,200)";
    const bold = "rgb(140,140,140)";
    ctx.lineWidth = 1;

    for (let gx = 0; gx <= W; gx++) {
      const X = PAD + gx * CELL + 0.5;
      ctx.strokeStyle = (gx % 10 === 0) ? bold : thin;
      ctx.beginPath();
      ctx.moveTo(X, PAD);
      ctx.lineTo(X, PAD + H * CELL);
      ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy++) {
      const Y = PAD + gy * CELL + 0.5;
      ctx.strokeStyle = (gy % 10 === 0) ? bold : thin;
      ctx.beginPath();
      ctx.moveTo(PAD, Y);
      ctx.lineTo(PAD + W * CELL, Y);
      ctx.stroke();
    }

    // legend
    const lx = PAD;
    const ly = PAD + H * CELL + 24;
    ctx.fillStyle = "#000";
    ctx.font = `16px sans-serif`;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
    ctx.fillText("Legend (DMC)", lx, ly - 5);

    for (let i = 0; i < legendItems.length; i++) {
      const u = legendItems[i];
      const yline = ly + i * 22;

      // color swatch
      ctx.fillStyle = `rgb(${u.r}, ${u.g}, ${u.b})`;
      ctx.strokeStyle = "rgb(120,120,120)";
      ctx.fillRect(lx, yline, 18, 18);
      ctx.strokeRect(lx, yline, 18, 18);

      // symbol box
      const sbx = lx + 26;
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.fillRect(sbx, yline, 18, 18);
      ctx.strokeRect(sbx, yline, 18, 18);

      // symbol text
      ctx.fillStyle = "#000";
      ctx.font = `16px monospace`;
      ctx.fillText(u.symbol!, sbx + 4, yline + 15);

      // code + name
      ctx.font = `16px sans-serif`;
      ctx.fillText(`${u.code} — ${u.name}  (${u.count})`, sbx + 26, yline + 15);
    }

    // download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "cross-stitch-edited-chart.png";
    a.click();
  }

  // Download raw edited grid (no legend) if you still want it
  function downloadPNG() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "cross-stitch-edited.png";
    a.click();
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl text-rose-900 font-semibold">Cross-Stitch Generator</h1>

        {/* 3 columns: 1) Generator  2) Uploaded image  3) Pattern result + Editor */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Column 1 — Generator */}
          <form
            onSubmit={onSubmit}
            className="grid content-start gap-4 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm text-gray-700">Image file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 items-end">
              <label className="block">
                <span className="text-sm text-gray-700">Max size (px)</span>
                <input
                  type="number"
                  min={16}
                  max={300}
                  step={1}
                  value={maxSizeStr}
                  onChange={(e) => setMaxSizeStr(e.target.value)}
                  onBlur={() => setMaxSizeStr(String(normalizedMaxSize()))}
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                  className="mt-1 block w-28 rounded-xl border border-gray-200 px-3 py-2"
                />
                <span className="mt-1 block text-xs text-gray-500">Keeps things snappy (≤ 300)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show 10×10 grid (editor)</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950 disabled:opacity-60"
                disabled={loading || !file}
              >
                {loading ? "Generating…" : "Generate"}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  setFile(null);
                  setData(null);
                  setGrid(null);
                  setError(null);
                  setShowGrid(false);
                  setMaxSizeStr("150");
                }}
              >
                Reset
              </button>
            </div>

            {error && <div className="text-rose-800">{error}</div>}
          </form>

          {/* Column 2 — Uploaded image preview */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-rose-900">Uploaded image</h2>
            <div className="mt-3">
              {filePreviewUrl ? (
                <div className="relative w-full">
                  <NextImage
                    src={filePreviewUrl}
                    alt="Uploaded preview"
                    width={600}
                    height={400}
                    className="rounded-lg border w-full h-auto"
                    unoptimized
                    priority
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Choose an image file to preview it here.
                </p>
              )}
            </div>
          </div>

          {/* Column 3 — Pattern + Editor */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-rose-900">Pattern</h2>
              {data && (
                <a
                  href={data.image_png_base64}
                  download="cross-stitch.png"
                  className="px-3 py-1.5 rounded-xl bg-rose-900 text-white hover:bg-rose-950 text-sm"
                >
                  Download Server PNG
                </a>
              )}
            </div>

            {!data ? (
              <p className="mt-3 text-sm text-gray-600">
                Generate to see your pattern and edit it.
              </p>
            ) : (
              <>
                {/* Server-rendered PNG (reference) */}
                <div className="mt-3">
                  <div className="relative w-full">
                    <NextImage
                      src={data.image_png_base64}
                      alt="Cross-stitch pattern (server)"
                      width={data.width}
                      height={data.height}
                      className="rounded-lg border w-full h-auto"
                      unoptimized
                      priority
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Size: {data.width}×{data.height}px
                  </p>
                </div>

                {/* Editor */}
                <hr className="my-4" />
                <h3 className="font-medium text-rose-900">Editor (click squares to paint)</h3>

                {/* color palette */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.palette_used.map((p) => {
                    const sel = currentColor === p.idx;
                    return (
                      <button
                        key={p.idx}
                        type="button"
                        onClick={() => setCurrentColor(p.idx)}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-sm ${sel ? "border-rose-900" : "border-gray-200"}`}
                        title={`${p.code} — ${p.name}`}
                      >
                        <span
                          className="inline-block h-5 w-5 rounded"
                          style={{ backgroundColor: `rgb(${p.r}, ${p.g}, ${p.b})` }}
                        />
                        <span className="text-gray-800">{p.code}</span>
                      </button>
                    );
                  })}
                </div>

                {/* canvas */}
                <div className="mt-3 overflow-auto rounded-lg border p-2">
                  <canvas
                    ref={canvasRef}
                    onClick={onCanvasClick}
                    className="block"
                  />
                </div>

                {/* export edited */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-sm"
                    onClick={downloadPNG}
                  >
                    Download Edited PNG (raw)
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-rose-900 text-white hover:bg-rose-950 text-sm"
                    onClick={downloadEditedChart}
                  >
                    Download Edited Chart (PNG)
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

