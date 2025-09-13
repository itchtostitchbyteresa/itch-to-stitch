'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';

type Row = { id: string; name: string | null; message: string; created_at: string };

export function Comments({ slug }: { slug: string }) {
  const [items, setItems] = React.useState<Row[]>([]);
  const [name, setName] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('comments')
      .select('id,name,message,created_at')
      .eq('slug', slug)
      .order('created_at', { ascending: true });
    if (!error && data) setItems(data);
  }

  React.useEffect(() => { load(); }, [slug]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    setErr(null);

    const { error } = await supabase.from('comments').insert({
      slug,
      name: name.trim() || null,
      message: msg.trim(),
    });

    setSending(false);
    if (error) { setErr('Could not post. Try again.'); return; }
    setMsg('');
    await load();
  }

  return (
    <div className="mt-12">
      <h3 className="font-semibold text-lg">Comments</h3>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
        />
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          required
          rows={4}
          placeholder="Say something nice…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
        />
        <button
          type="submit"
          disabled={sending || !msg.trim()}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
        >
          {sending ? 'Posting…' : 'Post comment'}
        </button>
        {err && <p className="text-sm text-red-700">{err}</p>}
      </form>

      <ul className="mt-6 space-y-4">
        {items.map((c) => (
          <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">
              {c.name || 'Anonymous'} • {new Date(c.created_at).toLocaleString()}
            </div>
            <p className="mt-1 text-gray-800 whitespace-pre-wrap">{c.message}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-gray-500">No comments yet.</li>
        )}
      </ul>
    </div>
  );
}
