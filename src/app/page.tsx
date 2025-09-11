'use client';


import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ALL_TAGS, POSTS, SITE_TITLE, formatDateISO } from '@/lib/posts';
import { Header } from '@/components/Header';


type TagChipProps = {
active: boolean;
children: React.ReactNode;
onClick: React.MouseEventHandler<HTMLButtonElement>;
};


type PostCardProps = { post: import('@/lib/posts').Post };


function TagChip({ active, children, onClick }: TagChipProps) {
return (
<button
onClick={onClick}
className={
'px-3 py-1 rounded-2xl text-xs border transition shadow-sm ' +
(active ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-gray-300')
}
>
{children}
</button>
);
}

function PostCard({ post }: PostCardProps) {
return (
<Link
href={`/posts/${post.slug}`}
className="group block rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition"
>
<div className="aspect-[4/3] overflow-hidden">
<img src={post.cover} alt={`Cover for ${post.title}`} className="h-full w-full object-cover group-hover:scale-105 transition" />
</div>
<div className="p-4">
<div className="text-xs text-gray-500">{formatDateISO(post.date)}</div>
<h3 className="mt-1 font-semibold">{post.title}</h3>
<p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
<div className="mt-3 flex flex-wrap gap-2">
{post.tags.map((t) => (
<span key={t} className="text-xs px-2 py-0.5 rounded-full border border-gray-200 text-gray-600">
{t}
</span>
))}
</div>
</div>
</Link>
);
}

export default function Page() {
const [activeTag, setActiveTag] = useState<string>('all');
const [q, setQ] = useState<string>('');


const list = useMemo(() => {
return POSTS.filter(
(p) => (activeTag === 'all' || p.tags.includes(activeTag)) &&
(p.title.toLowerCase().includes(q.toLowerCase()) || p.excerpt.toLowerCase().includes(q.toLowerCase()))
);
}, [activeTag, q]);

const GALLERY: { src: string; alt: string; href?: string }[] = [
  { src: "https://res.cloudinary.com/dl7fmgr2s/image/upload/f_auto,q_auto,w_220,h_220,c_fill,g_auto/20200514_124755_g2ytco.jpg", alt: "Bag - sunburst", href: "/posts/granny-square-basics" },
  { src: "https://res.cloudinary.com/dl7fmgr2s/image/upload/f_auto,q_auto,w_220,h_220,c_fill,g_auto/20200514_124755_g2ytco.jpg", alt: "Beanie - mustard" },
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
        <a
          key={i}
          href={item.href}
          className="group block rounded-lg overflow-hidden ring-1 ring-rose-200/60 hover:ring-rose-400"
          title={item.alt}
        >
          {Img}
        </a>
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
<a href="mailto:you@example.com?subject=Subscribe%20me%20to%20Itch%20To%20Stitch" className="inline-block mt-4 px-4 py-2 rounded-xl bg-black text-white">Subscribe by email</a>
</section>
</main>


<footer className="text-center text-xs text-gray-500 py-12">© {new Date().getFullYear()} {SITE_TITLE} • Built with ❤️ and Next.js</footer>
</div>
);
}
