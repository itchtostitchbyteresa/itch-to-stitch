"use client";
import { useMemo, useRef, useState } from "react";
import type { ApiOk, LegendItem, Cell, StitchKind, HalfSide } from "../types";
import { SYMBOLS } from "../types";
import { useEditorCanvas } from "../hooks/useEditorCanvas";

type Props = {
  data: ApiOk | null;
  grid: Cell[][] | null;
  setGrid: (g: (prev: Cell[][] | null) => Cell[][] | null) => void;
  currentColor: number | null;
  setCurrentColor: (i: number | null) => void;
  showGrid: boolean;
  setShowGrid: (b: boolean) => void;
};

export function EditorPanel({
  data, grid, setGrid, currentColor, setCurrentColor, showGrid, setShowGrid
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // stitch tool + which half to paint
  const [kind, setKind] = useState<StitchKind>("full");
  const [halfSide, setHalfSide] = useState<HalfSide>("A"); // which half to paint when half tool is active

  const paletteMap = useMemo(() => {
    const m = new Map<number, LegendItem>();
    if (data) for (const p of data.palette_used) m.set(p.idx, p);
    return m;
  }, [data]);

  useEditorCanvas(canvasRef, data, grid, paletteMap, showGrid, 18);

  function onCanvasClick(evt: React.MouseEvent<HTMLCanvasElement>) {
    if (!data || !grid || currentColor == null) return;
    const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
    const CELL = 18;
    const x = Math.floor((evt.clientX - rect.left) / CELL);
    const y = Math.floor((evt.clientY - rect.top) / CELL);
    if (x < 0 || y < 0 || x >= data.width || y >= data.height) return;

    setGrid(prev => {
      if (!prev) return prev;
      const next = prev.map(row => row.slice());
      const cell = next[y][x];

      if (kind === "full") {
        next[y][x] = { kind: "full", idx: currentColor };
        return next;
      }

      // half tools: ensure we have a diag cell with the right orientation
      const desiredDiag = kind === "halfSlash" ? "slash" : "backslash" as const;

      if (cell.kind !== "diag" || cell.diag !== desiredDiag) {
        // convert/reset to this orientation, keeping nothing from previous
        next[y][x] = { kind: "diag", diag: desiredDiag, a: null, b: null };
      }

      const diagCell = next[y][x] as Extract<Cell, { kind: "diag" }>;
      if (halfSide === "A") {
        diagCell.a = currentColor;
      } else {
        diagCell.b = currentColor;
      }
      return next;
    });
  }

  // ---- export helpers ----
  function tint([r, g, b]: [number, number, number], amt = 0.22) {
    const tr = Math.round(r + (255 - r) * amt);
    const tg = Math.round(g + (255 - g) * amt);
    const tb = Math.round(b + (255 - b) * amt);
    return `rgb(${tr}, ${tg}, ${tb})`;
  }

  /** Build legend; each painted half counts as 0.5 */
  function buildLegendFromGrid(g: Cell[]) {
    if (!data) return [];
    const counts = new Map<number, number>();
    for (const cell of g) {
      if (cell.kind === "full") {
        counts.set(cell.idx, (counts.get(cell.idx) || 0) + 1);
      } else {
        if (cell.a != null) counts.set(cell.a, (counts.get(cell.a) || 0) + 0.5);
        if (cell.b != null) counts.set(cell.b, (counts.get(cell.b) || 0) + 0.5);
      }
    }
    const items: Array<{ idx: number; count: number; r: number; g: number; b: number; code: string; name: string; symbol?: string; }> = [];
    for (const [idx, count] of counts.entries()) {
      const p = paletteMap.get(idx);
      if (!p) continue;
      items.push({ idx, count, r: p.r, g: p.g, b: p.b, code: p.code, name: p.name });
    }
    items.sort((a, b) => b.count - a.count);
    for (let i = 0; i < items.length; i++) items[i].symbol = SYMBOLS[i % SYMBOLS.length];
    return items;
  }

  function downloadEditedChart() {
    if (!data || !grid) return;
    const W = data.width, H = data.height, CELL = 20, PAD = 30;

    const flat: Cell[] = [];
    for (const row of grid) for (const c of row) flat.push(c);
    const legendItems = buildLegendFromGrid(flat);

    const LEGEND_H = 48 + 22 * legendItems.length;
    const CSS_W = PAD * 2 + W * CELL, CSS_H = PAD * 2 + H * CELL + LEGEND_H;

    const DPR = Math.min(2, window.devicePixelRatio || 1);
    const canvas = document.createElement("canvas");
    canvas.style.width = `${CSS_W}px`; canvas.style.height = `${CSS_H}px`;
    canvas.width = Math.floor(CSS_W * DPR); canvas.height = Math.floor(CSS_H * DPR);
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // background
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, CSS_W, CSS_H);

    // cells (tinted background fill)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        const x0 = PAD + x * CELL, y0 = PAD + y * CELL;

        if (cell.kind === "full") {
          const p = paletteMap.get(cell.idx); if (!p) continue;
          ctx.fillStyle = tint([p.r, p.g, p.b], 0.22);
          ctx.fillRect(x0, y0, CELL, CELL);
        } else if (cell.diag === "slash") {
          // A triangle
          if (cell.a != null) {
            const p = paletteMap.get(cell.a); if (p) {
              ctx.beginPath();
              ctx.moveTo(x0 + CELL, y0);
              ctx.lineTo(x0, y0 + CELL);
              ctx.lineTo(x0 + CELL, y0 + CELL);
              ctx.closePath();
              ctx.fillStyle = tint([p.r, p.g, p.b], 0.22); ctx.fill();
            }
          }
          // B triangle
          if (cell.b != null) {
            const p = paletteMap.get(cell.b); if (p) {
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x0 + CELL, y0);
              ctx.lineTo(x0, y0 + CELL);
              ctx.closePath();
              ctx.fillStyle = tint([p.r, p.g, p.b], 0.22); ctx.fill();
            }
          }
          // diagonal
          ctx.strokeStyle = "rgb(140,140,140)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x0 + CELL, y0); ctx.lineTo(x0, y0 + CELL); ctx.stroke();
        } else {
          // backslash
          if (cell.a != null) {
            const p = paletteMap.get(cell.a); if (p) {
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x0 + CELL, y0 + CELL);
              ctx.lineTo(x0, y0 + CELL);
              ctx.closePath();
              ctx.fillStyle = tint([p.r, p.g, p.b], 0.22); ctx.fill();
            }
          }
          if (cell.b != null) {
            const p = paletteMap.get(cell.b); if (p) {
              ctx.beginPath();
              ctx.moveTo(x0, y0);
              ctx.lineTo(x0 + CELL, y0);
              ctx.lineTo(x0 + CELL, y0 + CELL);
              ctx.closePath();
              ctx.fillStyle = tint([p.r, p.g, p.b], 0.22); ctx.fill();
            }
          }
          ctx.strokeStyle = "rgb(140,140,140)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + CELL, y0 + CELL); ctx.stroke();
        }
      }
    }

    // symbols (centered, same as before)
    ctx.fillStyle = "#000"; ctx.font = `${Math.floor(CELL * 0.6)}px monospace`;
    ctx.textBaseline = "middle"; ctx.textAlign = "center";
    const key = (r:number,g:number,b:number)=>`${r},${g},${b}`;
    const symMap = new Map<string,string>(); for (const u of legendItems) symMap.set(key(u.r,u.g,u.b), u.symbol!);

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const cell = grid[y][x];
      // choose symbol by majority color in the cell (A over B if only A exists, etc.)
      let idx: number | null = null;
      if (cell.kind === "full") idx = cell.idx;
      else idx = cell.a ?? cell.b ?? null;
      if (idx == null) continue;
      const p = paletteMap.get(idx); if (!p) continue;
      const sym = symMap.get(key(p.r,p.g,p.b)) || "X";
      const cx = PAD + x*CELL + CELL/2, cy = PAD + y*CELL + CELL/2 - 1;
      ctx.fillText(sym, cx, cy);
    }

    // grid
    const thin="rgb(200,200,200)", bold="rgb(140,140,140)"; ctx.lineWidth = 1;
    for (let gx=0; gx<=W; gx++){const X=PAD+gx*CELL+0.5; ctx.strokeStyle=(gx%10===0)?bold:thin; ctx.beginPath(); ctx.moveTo(X,PAD); ctx.lineTo(X,PAD+H*CELL); ctx.stroke();}
    for (let gy=0; gy<=H; gy++){const Y=PAD+gy*CELL+0.5; ctx.strokeStyle=(gy%10===0)?bold:thin; ctx.beginPath(); ctx.moveTo(PAD,Y); ctx.lineTo(PAD+W*CELL,Y); ctx.stroke();}

    // legend
    const lx = PAD, ly = PAD + H*CELL + 24;
    ctx.fillStyle = "#000"; ctx.font = `16px sans-serif`; ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
    ctx.fillText("Legend (DMC)", lx, ly - 5);
    for (let i=0;i<legendItems.length;i++){
      const u=legendItems[i], yline=ly+i*22, sbx=lx+26;
      ctx.fillStyle=`rgb(${u.r},${u.g},${u.b})`; ctx.strokeStyle="rgb(120,120,120)";
      ctx.fillRect(lx, yline, 18, 18); ctx.strokeRect(lx, yline, 18, 18);
      ctx.fillStyle="#fff"; ctx.fillRect(sbx, yline, 18, 18); ctx.strokeRect(sbx, yline, 18, 18);
      ctx.fillStyle="#000"; ctx.font=`16px monospace`; ctx.fillText(u.symbol!, sbx+4, yline+15);
      ctx.font=`16px sans-serif`; ctx.fillText(`${u.code} — ${u.name}  (${u.count})`, sbx+26, yline+15);
    }

    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = "cross-stitch-edited-chart.png"; a.click();
  }

  function downloadPNG() {
    const cvs = canvasRef.current; if (!cvs) return;
    const a = document.createElement("a");
    a.href = cvs.toDataURL("image/png");
    a.download = "cross-stitch-edited.png";
    a.click();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-rose-900">Editor</h2>
        <div className="flex items-center gap-4">
          {/* Stitch tool */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setKind("full")}
              className={`px-2 py-1 rounded border text-sm ${kind === "full" ? "border-rose-900" : "border-gray-300"}`}
              title="Full stitch"
            >
              Full
            </button>
            <button
              type="button"
              onClick={() => setKind("halfSlash")}
              className={`px-2 py-1 rounded border text-sm ${kind === "halfSlash" ? "border-rose-900" : "border-gray-300"}`}
              title="Half stitch /"
            >
              ½ /
            </button>
            <button
              type="button"
              onClick={() => setKind("halfBackslash")}
              className={`px-2 py-1 rounded border text-sm ${kind === "halfBackslash" ? "border-rose-900" : "border-gray-300"}`}
              title="Half stitch \"
            >
              ½ \
            </button>
          </div>

          {/* Which half to paint when using half tool */}
          {kind !== "full" && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-700">Paint:</span>
              <button
                type="button"
                onClick={() => setHalfSide("A")}
                className={`px-2 py-1 rounded border text-sm ${halfSide === "A" ? "border-rose-900" : "border-gray-300"}`}
                title="Paint half A"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setHalfSide("B")}
                className={`px-2 py-1 rounded border text-sm ${halfSide === "B" ? "border-rose-900" : "border-gray-300"}`}
                title="Paint half B"
              >
                B
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e)=>setShowGrid(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-gray-700">Show 10×10 grid</span>
          </label>
        </div>
      </div>

      {!data ? (
        <p className="mt-3 text-sm text-gray-600">Generate a pattern to unlock the editor.</p>
      ) : (
        <>
          {/* palette */}
          <div className="mt-3 flex flex-wrap gap-2">
            {data.palette_used.map((p) => {
              const sel = currentColor === p.idx;
              return (
                <button
                  key={p.idx}
                  type="button"
                  onClick={()=>setCurrentColor(p.idx)}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-sm ${sel ? "border-rose-900" : "border-gray-200"}`}
                  title={`${p.code} — ${p.name}`}
                >
                  <span className="inline-block h-5 w-5 rounded" style={{ backgroundColor: `rgb(${p.r}, ${p.g}, ${p.b})` }} />
                  <span className="text-gray-800">{p.code}</span>
                </button>
              );
            })}
          </div>

          {/* canvas */}
          <div className="mt-3 overflow-auto rounded-lg border p-2">
            <canvas ref={canvasRef} onClick={onCanvasClick} className="block" />
          </div>

          {/* export */}
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
  );
}
