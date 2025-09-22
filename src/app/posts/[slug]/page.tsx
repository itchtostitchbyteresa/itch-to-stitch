// src/app/posts/[slug]/page.tsx
import { notFound } from "next/navigation";
import { POSTS, formatDateISO } from "@/lib/posts";
import { Header } from "@/components/Header";
import { Pacifico } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { Comments } from "@/components/Comments";
import Image from "next/image";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

type Params = { slug: string };

// Optional cover dimensions that some posts may include
type WithCoverDims = { coverWidth?: number; coverHeight?: number };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return {};

  const url = `/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      images: [{ url: post.cover, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.cover],
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) return notFound();

  // Related posts pick
  const others = POSTS.filter((p) => p.slug !== slug);
  const overlap = (a: string[], b: string[]) => a.filter((t) => b.includes(t)).length;

  const similar = others
    .map((p) => ({ p, score: overlap(p.tags, post.tags) }))
    .filter((x) => x.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.p.date).getTime() - new Date(a.p.date).getTime()
    )
    .map((x) => x.p);

  const recent = [...others].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const picks: typeof others = [];
  for (const p of similar) if (picks.length < 3) picks.push(p);
  for (const p of recent) if (picks.length < 3 && !picks.includes(p)) picks.push(p);

  // Intrinsic sizing for the cover (no explicit `any` casts)
  const dims = post as unknown as WithCoverDims;
  const coverW = dims.coverWidth ?? 1600;
  const coverH = dims.coverHeight ?? 900;

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 mt-8 mb-20">
        <article className="prose prose-neutral max-w-none">
          <div className="text-xs text-gray-500">{formatDateISO(post.date)}</div>
          <h1 className={`mt-1 text-3xl font-extrabold text-rose-900 ${pacifico.className}`}>
            {post.title}
          </h1>

          {/* Cover: centered, capped width (smaller), rounded, no crop */}
          <div className="mt-5 mx-auto max-w-2xl">
            <Image
              src={post.cover}
              alt={`Cover for ${post.title}`}
              width={coverW}
              height={coverH}
              sizes="(min-width:1024px) 42rem, 100vw"
              className="w-full h-auto rounded-2xl border border-gray-200"
              priority={false}
            />
          </div>

          <div
            className="mt-6 text-gray-800"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>

        {picks.length > 0 && (
          <section className="mt-12">
            <h2 className={`text-xl text-rose-900 ${pacifico.className}`}>You might also like</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {picks.slice(0, 3).map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/posts/${rp.slug}`}
                  className="group block rounded-2xl overflow-hidden bg-white shadow hover:shadow-md transition"
                >
                  <div className="relative overflow-hidden min-h-[160px] sm:min-h-[180px] md:min-h-[200px]">
                    <Image
                      src={rp.cover}
                      alt={`Cover for ${rp.title}`}
                      fill
                      sizes="(min-width:1024px) 20rem, (min-width:640px) 50vw, 100vw"
                      className="object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[11px] text-gray-500">{formatDateISO(rp.date)}</div>
                    <div className="mt-0.5 font-semibold text-rose-900 line-clamp-2">
                      {rp.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                      {rp.excerpt}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Comments slug={post.slug} />
          <Link href="/" className="underline">
            ← Back to posts
          </Link>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              description: post.excerpt,
              image: [post.cover],
              datePublished: post.date,
              author: { "@type": "Person", name: "Teresa" },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://itchtostitchbyteresa.com/posts/${slug}`,
              },
            }),
          }}
        />
      </main>

      <footer className="text-center text-xs text-gray-500 py-12"></footer>
    </div>
  );
}


