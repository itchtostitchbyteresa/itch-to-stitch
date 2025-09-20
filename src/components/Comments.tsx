'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pacifico } from 'next/font/google';
import { getSupabaseClient } from '@/lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

const pacifico = Pacifico({ subsets: ['latin'], weight: '400' });

type CommentRow = {
  id: string;
  slug: string;
  name: string | null;
  message: string;
  created_at: string;     // timestamptz
  parent_id: string | null;
};

// Build a nested tree from the flat rows
function buildTree(rows: CommentRow[]) {
  const byId = new Map<string, CommentRow & { children: CommentRow[] }>();
  rows.forEach((r) => byId.set(r.id, { ...r, children: [] }));
  const roots: (CommentRow & { children: CommentRow[] })[] = [];

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function Comments({ slug }: { slug: string }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New comment (top-level)
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const msgRef = useRef<HTMLTextAreaElement | null>(null);

  // Reply box state (only one open at a time)
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('comments')
        .select('*')
        .eq('slug', slug)
        .order('created_at', { ascending: true }) as {
          data: CommentRow[] | null;
          error: PostgrestError | null;
        };

      if (err) throw err;
      setRows(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [slug, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  // Handlers
  const submitTopLevel = useCallback(async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('comments').insert({
        slug,
        name: name.trim() || null,
        message: message.trim(),
        parent_id: null,
      });
      if (err) throw err;
      setMessage('');
      setName('');
      await load();
      msgRef.current?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  }, [load, message, name, slug, supabase]);

  const submitReply = useCallback(async () => {
    if (!replyTo || !replyMessage.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('comments').insert({
        slug,
        name: replyName.trim() || null,
        message: replyMessage.trim(),
        parent_id: replyTo,
      });
      if (err) throw err;
      setReplyMessage('');
      setReplyName('');
      setReplyTo(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  }, [replyMessage, replyName, replyTo, slug, load, supabase]);

  const tree = useMemo(() => buildTree(rows), [rows]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-rose-900">Comments</h2>

      {error && <div className="mt-2 text-sm text-rose-800">{error}</div>}
      {loading && rows.length === 0 && <div className="mt-2 text-sm text-gray-500">Loading…</div>}

      {/* List */}
      <div className="mt-4 space-y-6">
        {tree.map((c) => (
          <CommentItem
            key={c.id}
            node={c}
            onReply={(id) => {
              setReplyTo((cur) => (cur === id ? null : id));
              setReplyName('');
              setReplyMessage('');
              setTimeout(() => replyRef.current?.focus(), 0);
            }}
          />
        ))}

        {tree.length === 0 && !loading && (
          <div className="text-sm text-gray-500">No comments yet.</div>
        )}
      </div>

      {/* Reply box (inline under the chosen comment) */}
      {replyTo && (
        <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
          <div className="text-xs text-gray-600">Replying…</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              value={replyName}
              onChange={(e) => setReplyName(e.target.value)}
              placeholder="Your name (optional)"
              className={`rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 ${pacifico.className} text-rose-900`}
            />
            <textarea
              ref={replyRef}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write a reply…"
              maxLength={2000}
              rows={3}
              className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={submitReply}
              className="px-3 py-1.5 rounded-xl bg-rose-900 text-white hover:bg-rose-950 disabled:opacity-60"
              disabled={loading || !replyMessage.trim()}
            >
              Reply
            </button>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New comment */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-medium text-gray-800">Add a comment</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className={`rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200 ${pacifico.className} text-rose-900`}
          />
          <textarea
            ref={msgRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write something nice…"
            maxLength={2000}
            rows={4}
            className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-rose-200"
          />
        </div>
        <div className="mt-2">
          <button
            type="button"
            onClick={submitTopLevel}
            className="px-4 py-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950 disabled:opacity-60"
            disabled={loading || !message.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </section>
  );
}

function CommentItem({
  node,
  onReply,
}: {
  node: CommentRow & { children: CommentRow[] };
  onReply: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <span className={`${pacifico.className} text-rose-900`}>
          {node.name || 'Anonymous'}
        </span>
        <span className="text-xs text-gray-500">• {fmtDate(node.created_at)}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{node.message}</p>
      <div className="mt-2">
        <button
          type="button"
          onClick={() => onReply(node.id)}
          className="text-xs text-rose-900 hover:text-rose-950"
        >
          Reply
        </button>
      </div>

      {node.children.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-rose-100 pl-3">
          {node.children.map((child) => (
            <div key={child.id}>
              <div className="flex items-center gap-2">
                <span className={`${pacifico.className} text-rose-900`}>
                  {child.name || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">• {fmtDate(child.created_at)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{child.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

