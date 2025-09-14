'use client';

import * as React from 'react';
import { supabase } from '@/lib/supabase';
import { Pacifico } from "next/font/google";
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

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
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from('comments')
      .select('id,slug,name,message,created_at,parent_id')
      .eq('slug', slug)
      .order('created_at', { ascending: true });

    if (!error && data) setItems(data as Row[]);
  }

  React.useEffect(() => { load(); }, [slug]);

  async function createComment(message: string, parent_id: string | null, authorName?: string) {
    if (!message.trim()) return;
    setSending(true);
    setErr(null);

    const { error } = await supabase.from('comments').insert({
      slug,
      name: (authorName ?? name).trim() || null,
      message: message.trim(),
      parent_id,
    });

    setSending(false);
    if (error) { setErr('Could not post. Try again.'); return; }

    if (!parent_id) setMsg('');
    setReplyingTo(null);
    await load();
  }

  function ReplyEditor({ parentId, onDone }: { parentId: string; onDone: () => void }) {
    // Local state so typing here doesn't touch the rest of the tree
    const [rName, setRName] = React.useState('');
    const [rMsg, setRMsg] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [localErr, setLocalErr] = React.useState<string | null>(null);

    async function submit(e: React.FormEvent) {
      e.preventDefault();
      if (!rMsg.trim()) return;
      setBusy(true);
      setLocalErr(null);
      const { error } = await supabase.from('comments').insert({
        slug,
        name: rName.trim() || null,
        message: rMsg.trim(),
        parent_id: parentId,
      });
      setBusy(false);
      if (error) { setLocalErr('Could not post. Try again.'); return; }
      setRMsg('');
      onDone();
      await load();
    }

    return (
      <form onSubmit={submit} className="mt-3 space-y-2" key={`reply-${parentId}`}>
        <input
          value={rName}
          onChange={(e) => setRName(e.target.value)}
          placeholder="Name (optional)"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
        />
        <textarea
          value={rMsg}
          onChange={(e) => setRMsg(e.target.value)}
          required
          rows={3}
          placeholder="Write a reply…"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy || !rMsg.trim()}
            className="px-3 py-2 rounded-lg bg-black text-white disabled:opacity-60"
          >
            {busy ? 'Posting…' : 'Post reply'}
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm underline text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
        {localErr && <p className="text-sm text-red-700">{localErr}</p>}
      </form>
    );
  }

  function CommentItem({ c }: { c: Row }) {
    const children = items.filter((x) => x.parent_id === c.id);

    return (
      <li className="rounded-xl border border-gray-200 bg-white p-4">
       <div className="text-sm text-gray-500">
  <span className={`${pacifico.className} text-[#C44B5A] text-base`}>
    {c.name || "Anonymous"}
  </span>
  <span className="mx-1">•</span>
  {new Date(c.created_at).toLocaleString()}
</div>
        <p className="mt-1 text-gray-800 whitespace-pre-wrap">{c.message}</p>

   <button
  onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
  className="mt-3 inline-flex items-center rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
>
  {replyingTo === c.id ? 'Cancel' : 'Reply'}
</button>


        {replyingTo === c.id && (
          <ReplyEditor parentId={c.id} onDone={() => setReplyingTo(null)} />
        )}

        {children.length > 0 && (
          <ul className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
            {children.map((child) => (
              <CommentItem key={child.id} c={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  const roots = items.filter((c) => !c.parent_id);

  return (
    <div className="mt-12">
      <h3 className="font-semibold text-lg">Comments</h3>

      {/* new top-level comment */}
      <form
        onSubmit={(e) => { e.preventDefault(); createComment(msg, null); }}
        className="mt-4 space-y-3"
      >
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

      {/* thread */}
      <ul className="mt-6 space-y-4">
        {roots.map((c) => (
          <CommentItem key={c.id} c={c} />
        ))}
        {roots.length === 0 && (
          <li className="text-sm text-gray-500">No comments yet.</li>
        )}
      </ul>
    </div>
  );
}
