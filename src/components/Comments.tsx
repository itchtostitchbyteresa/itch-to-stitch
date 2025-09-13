'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';

type Row = {
  id: string;
  slug: string;
  name: string | null;
  message: string;
  created_at: string;
  parent_id: string | null;
};

export function Comments({ slug }: { slug: string }) {
  const [items, setItems] = React.useState<Row[]>([]);
  const [name, setName] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [replyMsg, setReplyMsg] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('comments')
      .select('id,slug,name,message,created_at,parent_id')
      .eq('slug', slug)
      .order('created_at', { ascending: true });
    if (!error && data) setItems(data as Row[]);
  }

  React.useEffect(() => { load(); }, [slug]);

  async function createComment(message: string, parent_id: string | null) {
    setSending(true);
    setErr(null);
    const { error } = await supabase.from('comments').insert({
      slug,
      name: name.trim() || null,
      message: message.trim(),
      parent_id,
    });
    setSending(false);
    if (error) { setErr('Could not post. Try again.'); return; }
    if (!parent_id) setMsg(''); else setReplyMsg('');
    setReplyingTo(null);
    await load();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    await createComment(msg, null);
  }

  async function onReplySubmit(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    if (!replyMsg.trim()) return;
    await createComment(replyMsg, parentId);
  }

  // split into roots and children
  const roots = items.filter(c => !c.parent_id);
  const childrenByParent = items.reduce<Record<string, Row[]>>((acc, c) => {
    if (c.parent_id) {
      (acc[c.parent_id] ||= []).push(c);
    }
    return acc;
  }, {});

  return (
    <div className="mt-12">
      <h3 className="font-semibold text-lg">Comments</h3>

      {/* new top-level comment */}
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

      {/* list */}
      <ul className="mt-6 space-y-4">
        {roots.map(c => (
          <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-sm text-gray-500">
              {c.name || 'Anonymous'} • {new Date(c.created_at).toLocaleString()}
            </div>
            <p className="mt-1 text-gray-800 whitespace-pre-wrap">{c.message}</p>

            <button
              onClick={() => {
                setReplyingTo(replyingTo === c.id ? null : c.id);
                setReplyMsg('');
              }}
              className="mt-2 text-sm text-rose-700 hover:text-rose-900 underline"
            >
              {replyingTo === c.id ? 'Cancel' : 'Reply'}
            </button>

            {replyingTo === c.id && (
              <form onSubmit={(e) => onReplySubmit(e, c.id)} className="mt-3 space-y-2">
                <textarea
                  value={replyMsg}
                  onChange={(e) => setReplyMsg(e.target.value)}
                  required
                  rows={3}
                  placeholder="Write a reply…"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="submit"
                  disabled={sending || !replyMsg.trim()}
                  className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-60"
                >
                  {sending ? 'Posting…' : 'Post reply'}
                </button>
              </form>
            )}

            {/* children */}
            {!!childrenByParent[c.id]?.length && (
              <ul className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                {childrenByParent[c.id].map(r => (
                  <li key={r.id} className="bg-white">
                    <div className="text-sm text-gray-500">
                      {r.name || 'Anonymous'} • {new Date(r.created_at).toLocaleString()}
                    </div>
                    <p className="mt-1 text-gray-800 whitespace-pre-wrap">{r.message}</p>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}

        {roots.length === 0 && (
          <li className="text-sm text-gray-500">No comments yet.</li>
        )}
      </ul>
    </div>
  );
}
