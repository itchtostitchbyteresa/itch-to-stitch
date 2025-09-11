'use client';

import React, { useEffect, useMemo, useState } from 'react';

// === Site Settings ===
const SITE_TITLE = 'Itch To Stitch by Teresa';
const LOGO_URL = '/logo.png'; // Put your logo in /public/logo.png

// === Types ===
type Post = {
  slug: string;
  title: string;
  date: string; // ISO date
  tags: string[];
  excerpt: string;
  cover: string; // image URL
  html: string; // HTML string for body
};

type TagChipProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

type PostCardProps = {
  post: Post;
};

type PostViewProps = {
  slug: string;
};

// === Demo posts: replace with your own ===
const POSTS: Post[] = [
  {
    slug: 'granny-square-basics',
    title: 'Granny Square Basics',
    date: '2025-08-22',
    tags: ['tutorial', 'granny square'],
    excerpt:
      'My go-to method for neat corners and a flat join, plus yarn choices I like for durable squares.',
    cover:
      'https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757607330/20200514_124755_g2ytco.jpg',
    html: `
      <p>Everyone has their way to start a square. I’m a <em>magic ring</em> person—less bulk, cleaner center.</p>
      <h3 class="text-lg font-semibold mt-6">Hook & yarn</h3>
      <p>I like a 4.0mm with DK cotton for bags; 5.0mm with worsted acrylic for blankets.</p>
      <h3 class="text-lg font-semibold mt-6">Rounds</h3>
      <ol class="list-decimal ml-6">
        <li>Ring + 3 ch (counts as dc), 2 dc, <code>ch 2</code>, repeat 3 more times. Join.</li>
        <li>In each corner: <code>3 dc, ch 2, 3 dc</code>. Sides: <code>3 dc</code>.</li>
        <li>Block your squares. Future-you will thank you.</li>
      </ol>
    `,
  },
  {
    slug: 'fall-colors-palette',
    title: 'Fall Colors Palette',
    date: '2025-09-05',
    tags: ['inspiration', 'palette'],
    excerpt:
      'A cozy set of oranges, mauves, and soft yellow pulled from my sketchbook and stash.',
    cover:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
    html: `
      <p>Matching yarns to moods is half the fun. Here’s a quick palette that pairs nicely with neutrals.</p>
      <ul class="list-disc ml-6">
        <li>Rust + peach for warmth</li>
        <li>Mauve + lilac for soft contrast</li>
        <li>Butter yellow as a quiet highlight</li>
      </ul>
    `,
  },
  {
    slug: 'amigurumi-whale-notes',
    title: 'Amigurumi Whale – Notes',
    date: '2025-09-09',
    tags: ['notes', 'amigurumi'],
    excerpt: 'Pattern tweaks I use for a rounder body and a less pointy tail.',
    cover:
      'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1600&auto=format&fit=crop',
    html: `
      <p>Short rows near the tail help the curve. I also stuff lightly to avoid hard edges.</p>
      <p>For eyes, I embroider with cotton thread—safer for babies, still cute.</p>
    `,
  },
];

const ALL_TAGS: string[] = ['all', ...Array.from(new Set(POSTS.flatMap((p) => p.tags)))];

// Deterministic date format to avoid hydration mismatches
function formatDateISO(dateStr: string): string {
  // Treat input as date-only in UTC to avoid TZ shifts
  const d = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC',
  }).format(d);
}

// === Utilities ===
function useHashRoute(): string {
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    const getHash = () => window.location.hash.replace(/^#\//, "");
    setHash(getHash()); // set once on mount
    window.addEventListener("hashchange", getHash);
    return () => window.removeEventListener("hashchange", getHash);
  }, []);

  return hash;
}

// === UI Bits ===
function TagChip({ active, children, onClick }: TagChipProps) {
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1 rounded-2xl text-xs border transition shadow-sm ' +
        (active
          ? 'bg-black text-white border-black'
          : 'bg-white border-gray-200 hover:border-gray-300')
      }
    >
      {children}
    </button>
  );
}

function PostCard({ post }: PostCardProps) {
  return (
    <a
      href={`#/${post.slug}`}
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
        <div className="text-xs text-gray-500">
          {formatDateISO(post.date)}
        </div>
        <h3 className="mt-1 font-semibold">{post.title}</h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
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
      </div>
    </a>
  );
}

function Header() {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-8">
      <div className="flex items-center justify-between">
        <a href="#/" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-10 w-10 rounded-full border border-rose-100" />
          <span className="font-bold text-xl tracking-tight">{SITE_TITLE}</span>
        </a>
        <nav className="hidden sm:flex gap-6 text-sm">
          <a href="#/" className="hover:underline">
            Home
          </a>
          <a href="#/about" className="hover:underline">
            About
          </a>
          <a href="#/contact" className="hover:underline">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

function Home() {
  const [activeTag, setActiveTag] = useState<string>('all');
  const [q, setQ] = useState<string>('');

  const list = useMemo(() => {
    return POSTS.filter(
      (p) => (activeTag === 'all' || p.tags.includes(activeTag)) &&
        (p.title.toLowerCase().includes(q.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(q.toLowerCase()))
    );
  }, [activeTag, q]);

  return (
    <main className="max-w-6xl mx-auto px-6 mt-8 mb-20">
      {/* Hero */}
      <section className="grid md:grid-cols-[1.2fr,1fr] gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Cozy stitches, journal vibe.</h1>
          <p className="mt-4 text-lg text-gray-700">
            Notes, tutorials, and in‑progress pieces from my crochet table. No shop—just the making.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="#/about" className="px-5 py-3 rounded-xl border border-gray-300">
              About
            </a>
            <a href="#/contact" className="px-5 py-3 rounded-xl bg-black text-white">
              Say hi
            </a>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-amber-200/60 blur-2xl" />
          <div className="absolute -bottom-8 -right-10 h-24 w-24 rounded-full bg-rose-200/60 blur-2xl" />
          <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5">
            <img
              src="https://images.unsplash.com/photo-1503342452485-86ff0a0d936a?q=80&w=1600&auto=format&fit=crop"
              alt="Crochet hero"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((t) => (
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

      {/* Subscribe blurb */}
      <section className="mt-14 rounded-2xl border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-lg">Get new posts</h3>
        <p className="text-gray-600 mt-1">I’ll send an occasional note when something new lands.</p>
        <a
          href="mailto:you@example.com?subject=Subscribe%20me%20to%20Itch%20To%20Stitch"
          className="inline-block mt-4 px-4 py-2 rounded-xl bg-black text-white"
        >
          Subscribe by email
        </a>
      </section>
    </main>
  );
}

function PostView({ slug }: PostViewProps) {
  const post = useMemo(() => POSTS.find((p) => p.slug === slug), [slug]);
  if (!post)
    return (
      <main className="max-w-3xl mx-auto px-6 mt-12">
        <p className="text-gray-600">
          Couldn’t find that post.{' '}
          <a className="underline" href="#/">
            Back home
          </a>
          .
        </p>
      </main>
    );
  return (
    <main className="max-w-3xl mx-auto px-6 mt-8 mb-20">
      <article className="prose prose-neutral max-w-none">
        <div className="text-xs text-gray-500">{formatDateISO(post.date)}</div>
        <h1 className="mt-1 text-3xl font-extrabold">{post.title}</h1>
        <img src={post.cover} alt={`Cover for ${post.title}`} className="rounded-xl mt-6" />
        {/* eslint-disable-next-line react/no-danger */}
        <div className="mt-6 text-gray-800" dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <div className="mt-10">
        <a href="#/" className="underline">
          ← Back to posts
        </a>
      </div>
    </main>
  );
}

function About() {
  return (
    <main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
      <h1 className="text-3xl font-extrabold">About</h1>
      <p className="mt-4 text-gray-700 leading-relaxed">
        I’m Teresa, a computer science student who unwinds with yarn and a hook. This space is a logbook—what I’m trying,
        what’s working, and the occasional pattern note.
      </p>
    </main>
  );
}

function Contact() {
  return (
    <main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
      <h1 className="text-3xl font-extrabold">Contact</h1>
      <p className="mt-4 text-gray-700">Questions or friendly yarn chat?</p>
      <div className="mt-6 flex items-center gap-3">
        <a href="mailto:you@example.com?subject=Hello%20from%20your%20blog" className="px-5 py-3 rounded-xl bg-black text-white">
          Email me
        </a>
      </div>
    </main>
  );
}

export default function Page() {
  const route = useHashRoute();
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    const [, maybeSlug] = route.split('/');
    setSlug(maybeSlug || null);
  }, [route]);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      {route.startsWith('about') ? (
        <About />
      ) : route.startsWith('contact') ? (
        <Contact />
      ) : slug ? (
        <PostView slug={slug} />
      ) : (
        <Home />
      )}
      <footer className="text-center text-xs text-gray-500 py-12">
        © {new Date().getFullYear()} {SITE_TITLE} • Built with ❤️ and Next.js
      </footer>
    </div>
  );
}
