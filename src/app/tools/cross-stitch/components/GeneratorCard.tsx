"use client";
import NextImage from "next/image";
import { useMemo } from "react";

type Props = {
  file: File | null;
  setFile: (f: File | null) => void;
  maxSizeStr: string;
  setMaxSizeStr: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  loading: boolean;
  error: string | null;
};

export function GeneratorCard({
  file, setFile, maxSizeStr, setMaxSizeStr, onSubmit, reset, loading, error
}: Props) {
  const filePreviewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // ---- sizing helpers (cap longest side at 100, keep aspect)
  function clampMaxSize(n: number) {
    if (!Number.isFinite(n)) return 100;
    return Math.max(16, Math.min(100, Math.round(n)));
  }
  function normalizedMaxSize(): number {
    const n = parseInt(maxSizeStr, 10);
    return clampMaxSize(Number.isNaN(n) ? 100 : n);
  }

  function onFileChange(f: File | null) {
    if (!f) return setFile(null);
    const MAX_BYTES = 3 * 1024 * 1024;
    if (f.size > MAX_BYTES) {
      setFile(null);
      alert("That file is over 3 MB. Try a smaller image or reduce dimensions.");
      return;
    }
    setFile(f);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <form onSubmit={onSubmit} className="grid content-start gap-4">
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
              max={100}   // cap at 100
              step={1}
              value={maxSizeStr}
              onChange={(e) => setMaxSizeStr(e.target.value)}
              onBlur={() => setMaxSizeStr(String(normalizedMaxSize()))}
              onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
              className="mt-1 block w-28 rounded-xl border border-gray-200 px-3 py-2"
            />
            <span className="mt-1 block text-xs text-gray-500">Longest side ≤ 100</span>
          </label>

          <div className="flex items-center gap-3">
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
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </div>

        {error && <div className="text-rose-800">{error}</div>}
      </form>

      {/* Uploaded preview in SAME card */}
      <div className="mt-4">
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
            <p className="text-sm text-gray-600">Choose an image file to preview it here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
