"use client";
import { useEffect, MutableRefObject } from "react";
import type { ApiOk, LegendItem, Cell } from "../types";

/**
 * Draws the editable grid to a canvas.
 * Supports full and two-color half stitches.
 *
 * Diagonal halves:
 * - diag: 'slash'   -> diagonal from top-right to bottom-left (/)
 *   - Half A region: triangle (top-right ↘ bottom-left)
 *   - Half B region: the opposite triangle
 * - diag: 'backslash' -> diagonal from top-left to bottom-right (\)
 *   - Half A region: triangle (top-left ↘ bottom-right)
 *   - Half B region: the opposite triangle
 */
export function useEditorCanvas(
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  data: ApiOk | null,
  grid: Cell[][] | null,
  paletteMap: Map<number, LegendItem>,
  showGrid: boolean,
  cellPx = 18
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || !grid) return;

    const { width: W, height: H } = data;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
    const cssW = W * cellPx;
    const cssH = H * cellPx;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    canvas.width = Math.floor(cssW * DPR);
    canvas.height = Math.floor(cssH * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // background
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cssW, cssH);

    // draw cells
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cell = grid[y][x];
        const x0 = x * cellPx, y0 = y * cellPx;

        if (cell.kind === "full") {
          const p = paletteMap.get(cell.idx);
          ctx.fillStyle = p ? `rgb(${p.r}, ${p.g}, ${p.b})` : "rgb(0,0,0)";
          ctx.fillRect(x0, y0, cellPx, cellPx);
          continue;
        }

        // half/diag
        // Fetch colors (may be null for unpainted half)
        const colA = cell.a != null ? paletteMap.get(cell.a) : null;
        const colB = cell.b != null ? paletteMap.get(cell.b) : null;

        if (cell.diag === "slash") {
          // '/' diagonal from (x0+cellPx,y0) to (x0,y0+cellPx)
          // Half A triangle (top-right, bottom-left, bottom-right)
          if (colA) {
            ctx.beginPath();
            ctx.moveTo(x0 + cellPx, y0);
            ctx.lineTo(x0, y0 + cellPx);
            ctx.lineTo(x0 + cellPx, y0 + cellPx);
            ctx.closePath();
            ctx.fillStyle = `rgb(${colA.r}, ${colA.g}, ${colA.b})`;
            ctx.fill();
          }
          // Half B triangle (top-left, top-right, bottom-left)
          if (colB) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + cellPx, y0);
            ctx.lineTo(x0, y0 + cellPx);
            ctx.closePath();
            ctx.fillStyle = `rgb(${colB.r}, ${colB.g}, ${colB.b})`;
            ctx.fill();
          }
          // diagonal line
          ctx.strokeStyle = "rgba(0,0,0,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x0 + cellPx, y0);
          ctx.lineTo(x0, y0 + cellPx);
          ctx.stroke();
        } else {
          // '\' diagonal from (x0,y0) to (x0+cellPx,y0+cellPx)
          // Half A triangle (top-left, bottom-right, bottom-left)
          if (colA) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + cellPx, y0 + cellPx);
            ctx.lineTo(x0, y0 + cellPx);
            ctx.closePath();
            ctx.fillStyle = `rgb(${colA.r}, ${colA.g}, ${colA.b})`;
            ctx.fill();
          }
          // Half B triangle (top-left, top-right, bottom-right)
          if (colB) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + cellPx, y0);
            ctx.lineTo(x0 + cellPx, y0 + cellPx);
            ctx.closePath();
            ctx.fillStyle = `rgb(${colB.r}, ${colB.g}, ${colB.b})`;
            ctx.fill();
          }
          // diagonal line
          ctx.strokeStyle = "rgba(0,0,0,0.35)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(x0 + cellPx, y0 + cellPx);
          ctx.stroke();
        }
      }
    }

    // grid overlay (optional)
    if (showGrid) {
      ctx.save();
      ctx.lineWidth = 1;
      const thin = "rgba(0,0,0,0.25)";
      const bold = "rgba(0,0,0,0.5)";
      ctx.strokeStyle = thin;
      for (let gx = 0; gx <= W; gx++) {
        ctx.beginPath(); ctx.moveTo(gx * cellPx + 0.5, 0); ctx.lineTo(gx * cellPx + 0.5, cssH); ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy++) {
        ctx.beginPath(); ctx.moveTo(0, gy * cellPx + 0.5); ctx.lineTo(cssW, gy * cellPx + 0.5); ctx.stroke();
      }
      ctx.strokeStyle = bold;
      for (let gx = 0; gx <= W; gx += 10) {
        ctx.beginPath(); ctx.moveTo(gx * cellPx + 0.5, 0); ctx.lineTo(gx * cellPx + 0.5, cssH); ctx.stroke();
      }
      for (let gy = 0; gy <= H; gy += 10) {
        ctx.beginPath(); ctx.moveTo(0, gy * cellPx + 0.5); ctx.lineTo(cssW, gy * cellPx + 0.5); ctx.stroke();
      }
      ctx.restore();
    }
  }, [canvasRef, data, grid, paletteMap, showGrid, cellPx]);
}

