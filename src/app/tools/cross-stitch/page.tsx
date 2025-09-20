'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';

type LegendItem = {
  code: string;
  name: string;
  r: number;
  g: number;
  b: number;
  count: number;
};

type ApiOk = {
  width: number;
  height: number;
  image_png_base64: string; // data URL
  palette_used: LegendItem[];
};

type ApiErr = { error: string; trace?: string };

type ApiResult = ApiOk | ApiErr;

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [maxSize, setMaxSize] = useState(150);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiOk | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const fd = new FormData();
      fd.append('max_size', String(maxSize));
      if (file) fd.append('image', file);
      else fd.append('image_url', imageUrl.trim());

      const res = await fetch('/api/cross_stitch', { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';

      // Make sure we actually got JSON back
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${txt.slice(0, 160)}`);
      }

      const json: ApiResult = await res.json();
      if (!res.ok) {
        const msg = 'error' in json ? json.error : `HTTP ${res.status}`;
        throw new Error(msg);
      }
      if ('error' in json) {
        throw new Error(json.error);
      }

      setData(json);
    } catch (err: unknown) {
      let msg = 'Something went wrong';
      if (err instanceof Error) msg = err.message;
      else if (typeof err === 'string') msg = err;
      else {
        try { msg = JSON.stringify(err); } catch { /* ignore */ }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-rose-900 font-semibold">Cross-Stitch Generator</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Image file</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Image URL</span>
            <input
              type="url"
              placeholder="https://…"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2"
            />
          </label>
        </div>

        <label className="block max-w-xs">
          <span className="text-sm text-gray-700">Max size (px)</span>
          <input
            type="number"
            min={16}
            max={600}
            value={maxSize}
            onChange={(e) => setMaxSize(Number(e.target.value || 150))}
            className="mt-1 block w-28 rounded-xl border border-gray-200 px-3 py-2"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950 disabled:opacity-60"
            disabled={loading || (!file && !imageUrl)}
          >
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
            onClick={() => {
              setFile(null);
              setImageUrl('');
              setData(null);
              setError(null);
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-rose-800">{error}</div>}

      {data && (
        <section className="mt-8 grid gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-rose-900">Preview ({data.width}×{data.height})</h2>
            <div className="mt-3 w-full max-w-md">
              <NextImage
                src={data.image_png_base64}
                alt="Cross-stitch preview"
                width={data.width}
                height={data.height}
                className="rounded-lg border w-full h-auto"
                unoptimized
                priority
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-rose-900">Palette used</h3>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.palette_used.map((c) => (
                <li key={c.code} className="flex items-center gap-3 text-sm">
                  <span
                    className="inline-block h-6 w-6 rounded border"
                    style={{ backgroundColor: `rgb(${c.r}, ${c.g}, ${c.b})` }}
                  />
                  <span className="font-medium">{c.code}</span>
                  <span className="text-gray-600">{c.name}</span>
                  <span className="ml-auto tabular-nums text-gray-500">{c.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
