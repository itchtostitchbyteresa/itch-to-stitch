"use client";

import React, { useEffect, useMemo, useState } from "react";
import NextImage from "next/image";
import { Header } from "@/components/Header";

type ApiOk = {
  width: number;
  height: number;
  image_png_base64: string; // data URL
};

type ApiErr = { error: string; trace?: string };
type ApiResult = ApiOk | ApiErr;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  // keep as string while typing so "4" → "40" works
  const [maxSizeStr, setMaxSizeStr] = useState<string>("150");

  const [fullPalette, setFullPalette] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiOk | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (!file) return; // safety guard

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const fd = new FormData();
      fd.append("max_size", String(normalizedMaxSize()));
      fd.append("palette", fullPalette ? "full" : "basic"); // server can ignore if unsupported
      fd.append("image", file); // file only (URL support removed)

      const res = await fetch("/api/cross_stitch", { method: "POST", body: fd });
      const ct = res.headers.get("content-type") || "";

      if (!ct.includes("application/json")) {
        const txt = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${txt.slice(0, 160)}`);
      }

      const json: ApiResult = await res.json();

      if (!res.ok) {
        const msg = "error" in json ? json.error : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      if ("error" in json) throw new Error(json.error);

      setData(json);
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

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl text-rose-900 font-semibold">Cross-Stitch Generator</h1>

        {/* 3 columns: 1) Generator  2) Uploaded image  3) Pattern result */}
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

            <div className="grid sm:grid-cols-3 gap-4 items-end">
              <label className="block">
                <span className="text-sm text-gray-700">Max size (px)</span>
                <input
                  type="number"
                  min={16}
                  max={300}
                  step={1}
                  value={maxSizeStr}
                  onChange={(e) => setMaxSizeStr(e.target.value)} // let user type freely
                  onBlur={() => setMaxSizeStr(String(normalizedMaxSize()))} // clamp on blur
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()} // avoid scroll jumps
                  className="mt-1 block w-28 rounded-xl border border-gray-200 px-3 py-2"
                />
                <span className="mt-1 block text-xs text-gray-500">Keeps things snappy (≤ 300)</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fullPalette}
                  onChange={(e) => setFullPalette(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Full DMC palette</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">10×10 grid overlay</span>
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

          {/* Column 3 — Pattern generated */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-rose-900">Pattern</h2>
              {data && (
                <a
                  href={data.image_png_base64}
                  download="cross-stitch.png"
                  className="px-3 py-1.5 rounded-xl bg-rose-900 text-white hover:bg-rose-950 text-sm"
                >
                  Download PNG
                </a>
              )}
            </div>

            {!data ? (
              <p className="mt-3 text-sm text-gray-600">
                Generate to see your crisp PNG pattern here.
              </p>
            ) : (
              <div className="mt-3">
                <div className="relative w-full">
                  <NextImage
                    src={data.image_png_base64}
                    alt="Cross-stitch pattern"
                    width={data.width}
                    height={data.height}
                    className="rounded-lg border w-full h-auto"
                    unoptimized
                    priority
                  />
                  {showGrid && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 10px), repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 10px)",
                        backgroundSize: "10px 10px, 10px 10px",
                      }}
                    />
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Size: {data.width}×{data.height}px
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
