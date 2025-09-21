'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { POSTS, SITE_TITLE, formatDateISO } from '@/lib/posts';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer'; // 👈 import your Footer

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
      <div className="relative aspect-[4/3] overflow-hidden">
        <NextImage
          src={post.cover}
          alt={`Cover for ${post.title}`}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition"
          priority={false}
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

function HomeInner() {
  const [activeTag, setActiveTag] = useState<string>('all');
  const [q, setQ] = useState<string>('');
  const TOP_N_TAGS = 6;

  const topTags = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of POSTS) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N_TAGS)
      .map(([t]) => t);

    return ['all', ...sorted];
  }, []);

  const list = useMemo(() => {
    return POSTS.filter(
      (p) =>
        (activeTag === 'all' || p.tags.includes(activeTag)) &&
        (p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeTag, q]);

  const GALLERY: { src: string; alt: string; href?: string }[] = [
    {
      src: 'https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757618999/owl_wreath_full_f5kpid.jpg',
      alt: 'Wreath - autumn',
      href: '/posts/fall-wreath-notes',
    },
  ];

  return (
    <>
      {/* Gallery row */}
      <section className="mt-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {GALLERY.map((item, i) => {
            const Img = (
              <div className="relative w-full aspect-square">
                <NextImage
                  src={item.src}
                  alt={item.alt || `Crochet ${i + 1}`}
                  fill
                  sizes="(min-width:1024px) 12.5vw, (min-width:768px) 16.6vw, (min-width:640px) 25vw, 33vw"
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              </div>
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
            <TagChip key={t} active={t === activeTag} onClick={() => setActiveTag(t)}>
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
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌘K</span>
        </div>
      </section>

      {/* Feed */}
      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-16">No posts yet.</div>
        )}
      </section>

      {/* Contact only */}
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
    </>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-6 mt-8 mb-20">
        <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
          <HomeInner />
        </Suspense>
      </main>
      <Footer /> {/* 👈 drop it in */}
    </div>
  );
}
