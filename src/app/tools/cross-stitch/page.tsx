'use client';

import React, { useState } from 'react';

type LegendItem = { code: string; name: string; r: number; g: number; b: number; count: number };
type ApiResult = { width: number; height: number; image_png_base64: string; palette_used: LegendItem[]; error?: string };


export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [maxSize, setMaxSize] = useState(150);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResult | null>(null);
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

      // ⬇️ THIS is the fetch call and where it lives
      const res = await fetch('/api/cross_stitch', { method: 'POST', body: fd });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const txt = await res.text();
        throw new Error(`Expected JSON, got ${ct}. First bytes: ${txt.slice(0, 160)}`);
      }
      const json: ApiResult = await res.json();
      if (!res.ok || (json as any).error) throw new Error((json as any).error || `HTTP ${res.status}`);
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
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
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)}
                   className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
          <label className="block">
            <span className="text-sm text-gray-700">Image URL</span>
            <input type="url" placeholder="https://…" value={imageUrl}
                   onChange={(e) => setImageUrl(e.target.value)}
                   className="mt-1 block w-full rounded-xl border border-gray-200 px-3 py-2" />
          </label>
        </div>

        <label className="block max-w-xs">
          <span className="text-sm text-gray-700">Max size (px)</span>
          <input type="number" min={16} max={600} value={maxSize}
                 onChange={(e) => setMaxSize(parseInt(e.target.value || '150', 10))}
                 className="mt-1 block w-28 rounded-xl border border-gray-200 px-3 py-2" />
        </label>

        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950 disabled:opacity-60"
                  disabled={loading || (!file && !imageUrl)}>
            {loading ? 'Generating…' : 'Generate'}
          </button>
          <button type="button" className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50"
                  onClick={() => { setFile(null); setImageUrl(''); setData(null); setError(null); }}>
            Reset
          </button>
        </div>
      </form>

      {error && <div className="mt-4 text-rose-800">{error}</div>}

      {data && (
        <section className="mt-8 grid gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-rose-900">Preview ({data.width}×{data.height})</h2>
            <img src={data.image_png_base64} alt="Cross-stitch preview" className="mt-3 w-full max-w-md rounded-lg border" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-rose-900">Palette used</h3>
            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.palette_used.map((c) => (
                <li key={c.code} className="flex items-center gap-3 text-sm">
                  <span className="inline-block h-6 w-6 rounded border" style={{ backgroundColor: `rgb(${c.r},${c.g},${c.b})` }} />
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
