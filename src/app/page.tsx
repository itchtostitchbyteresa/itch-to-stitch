'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { POSTS, SITE_TITLE, formatDateISO } from '@/lib/posts';
import { Header } from '@/components/Header';

type TagChipProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

type PostCardProps = { post: import('@/lib/posts').Post; showTags?: boolean };

function TagChip({ active, children, onClick }: TagChipProps) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1 rounded-2xl text-xs border transition shadow-sm ' +
        (active
          ? 'bg-rose-900 text-white hover:bg-rose-950 border-rose-900'
          : 'bg-white border-gray-200 hover:border-gray-300')
      }
    >
      {children}
    </button>
  );
}

function PostCard({ post, showTags = false }: PostCardProps) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={post.cover}
          alt={`Cover for ${post.title}`}
          className="h-full w-full object-cover group-hover:scale-105 transition"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-gray-500">{formatDateISO(post.date)}</div>
        <h3 className="mt-1 font-semibold text-rose-900">{post.title}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        {showTags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-600"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

const PAGE_SIZE = 9;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTag, setActiveTag] = useState<string>('all');
  const [q, setQ] = useState<string>('');
  const TOP_N_TAGS = 6;

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of POSTS) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // most posts first
      .slice(0, TOP_N_TAGS)
      .map(([t]) => t);

    return ['all', ...sorted];
  }, []);

  // Filtered list (by tag + search)
  const filtered = useMemo(() => {
    return POSTS.filter(
      (p) =>
        (activeTag === 'all' || p.tags.includes(activeTag)) &&
        (p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeTag, q]);

  // Pagination: read from URL
  const rawPage = Number(searchParams.get('page') || '1');
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(isNaN(rawPage) ? 1 : rawPage, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  // When filters/search change, reset to page 1 in the URL
  useEffect(() => {
    const sp = new URLSearchParams(searchParams);
    if (sp.has('page')) {
      sp.delete('page');
      router.replace('?' + sp.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, q]);

  const goToPage = (n: number, opts: { replace?: boolean } = {}) => {
    const target = Math.min(Math.max(n, 1), Math.max(totalPages, 1));
    const sp = new URLSearchParams(searchParams);
    if (target === 1) sp.delete('page');
    else sp.set('page', String(target));
    const url = '?' + sp.toString();
    (opts.replace ? router.replace : router.push)(url);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Build compact page numbers (1 … prev, current, next … last)
  const pageList = (() => {
    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1, 2, totalPages - 1]);
    return [...pages]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
  })();

  const GALLERY: { src: string; alt: string; href?: string }[] = [
    {
      src: 'https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757618999/owl_wreath_full_f5kpid.jpg',
      alt: 'Wreath - autumn',
      href: '/posts/fall-wreath-notes',
    },
    // ...add as many as you want
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 mt-8 mb-20">
        {/* Hero → gallery row */}
        <section className="mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {GALLERY.map((item, i) => {
              const Img = (
                <img
                  src={item.src}
                  alt={item.alt || `Crochet ${i + 1}`}
                  className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              );
              return item.href ? (
                <Link
                  key={i}
                  href={item.href}
                  className="group block rounded-lg overflow-hidden ring-1 ring-rose-200/60 hover:ring-rose-400"
                  title={item.alt}
                >
                  {Img}
                </Link>
              ) : (
                <div
                  key={i}
                  className="group rounded-lg overflow-hidden ring-1 ring-rose-200/60"
                  title={item.alt}
                >
                  {Img}
                </div>
              );
            })}
          </div>
        </section>

        {/* Controls */}
        <section className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {topTags.map((t) => (
              <TagChip
                key={t}
                active={t === activeTag}
                onClick={() => setActiveTag(t)}
              >
                {t}
              </TagChip>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search posts…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full md:w-72 rounded-2xl border border-gray-200 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-black/10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              ⌘K
            </span>
          </div>
        </section>

        {/* Feed (paginated) */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-16">
              No posts yet.
            </div>
          )}
        </section>

        {/* Pagination controls */}
        {filtered.length > 0 && totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-xl border border-gray-200 disabled:opacity-40"
            >
              Prev
            </button>

            {/* Numbered buttons with ellipses */}
            <div className="flex items-center gap-1">
              {pageList.map((n, i) => {
                const prev = pageList[i - 1];
                const showDots = i > 0 && prev !== undefined && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {showDots && <span className="px-1 text-gray-400">…</span>}
                    <button
                      onClick={() => goToPage(n)}
                      aria-current={n === currentPage ? 'page' : undefined}
                      className={
                        'px-3 py-1 rounded-xl border ' +
                        (n === currentPage
                          ? 'bg-rose-900 text-white border-rose-900'
                          : 'border-gray-200 hover:border-gray-300')
                      }
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-xl border border-gray-200 disabled:opacity-40"
            >
              Next
            </button>

            <span className="ml-3 text-xs text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
          </nav>
        )}

        {/* Contact only (subscribe shelved) */}
        <section className="mt-14">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-lg">Say hi</h3>
            <p className="text-gray-600 mt-1">Questions, ideas, or friendly yarn chat.</p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/contact"
                className="px-4 py-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950"
              >
                Contact page
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-gray-500 py-12">
        © {new Date().getFullYear()} {SITE_TITLE} • Built with ❤️ and Next.js
      </footer>
    </div>
  );
}

