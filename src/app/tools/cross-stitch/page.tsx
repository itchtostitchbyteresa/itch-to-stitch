"use client";
import React, { useState } from "react";
import { Header } from "@/components/Header";
import type { ApiOk, ApiResult, Cell } from "./types";
import { GeneratorCard } from "./components/GeneratorCard";
import { PatternCard } from "./components/PatternCard";
import { EditorPanel } from "./components/EditorPanel";

export default function Page() {
  // UI state
  const [file, setFile] = useState<File | null>(null);
  const [maxSizeStr, setMaxSizeStr] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [data, setData] = useState<ApiOk | null>(null);
  const [grid, setGrid] = useState<Cell[][] | null>(null); // <-- now Cell[][]
  const [currentColor, setCurrentColor] = useState<number | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  function clampMaxSize(n: number) {
    if (!Number.isFinite(n)) return 100;
    return Math.max(16, Math.min(100, Math.round(n)));
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
      fd.append("max_size", String(clampMaxSize(parseInt(maxSizeStr, 10))));
      fd.append("image", file);

      const res = await fetch("/api/cross_stitch", { method: "POST", body: fd });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${txt.slice(0, 160)}`);
      }
      const json: ApiResult = await res.json();
      if (!res.ok || "error" in json) throw new Error(("error" in json ? json.error : `HTTP ${res.status}`));

      const ok = json as ApiOk;
      setData(ok);

      // Transform server labels -> Cell[][] with full stitches
      const cellGrid: Cell[][] = ok.labels.map(row => row.map(idx => ({ idx, kind: "full" as const })));
      setGrid(cellGrid);

      setCurrentColor(ok.palette_used[0]?.idx ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : typeof err === "string" ? err : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setFile(null);
    setData(null);
    setGrid(null);
    setError(null);
    setShowGrid(false);
    setMaxSizeStr("100");
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl text-rose-900 font-semibold">Cross-Stitch Generator</h1>

        {/* Row 1: Generator + Pattern (2 columns) */}
        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <GeneratorCard
            file={file} setFile={setFile}
            maxSizeStr={maxSizeStr} setMaxSizeStr={setMaxSizeStr}
            onSubmit={onSubmit} reset={reset}
            loading={loading} error={error}
          />
          <PatternCard data={data} />
        </section>

        {/* Row 2: Editor full-width */}
        <section className="mt-6">
          <EditorPanel
            data={data}
            grid={grid}
            setGrid={setGrid}
            currentColor={currentColor}
            setCurrentColor={setCurrentColor}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
          />
        </section>
      </main>
    </div>
  );
}

