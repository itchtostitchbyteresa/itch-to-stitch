import { notFound } from "next/navigation";
import { POSTS, formatDateISO, SITE_TITLE } from "@/lib/posts";
import { Header } from "@/components/Header";
import { Pacifico } from "next/font/google";
import Link from "next/link";
import type { Metadata } from "next";
import { Comments } from "@/components/Comments";
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;           // your Next needs await
  const post = POSTS.find(p => p.slug === slug);
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
  const post = POSTS.find(p => p.slug === slug);  
  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 mt-8 mb-20">
        <article className="prose prose-neutral max-w-none">
          <div className="text-xs text-gray-500">{formatDateISO(post.date)}</div>
       <h1 className={`mt-1 text-3xl font-extrabold text-rose-900 ${pacifico.className}`}>
  {post.title}
</h1>

          <img
            src={post.cover}
            alt={`Cover for ${post.title}`}
            className="rounded-xl mt-6 max-w-xl mx-auto"
          />
          {/* eslint-disable-next-line react/no-danger */}
          <div
            className="mt-6 text-gray-800"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
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
        "@id": `https://itchtostitchbyTeresa.com/posts/${slug}` // ← replace with your real domain
      }
    }),
  }}
/>
      </main>
      <footer className="text-center text-xs text-gray-500 py-12">
        © {new Date().getFullYear()} {SITE_TITLE} • Built with ❤️ and Next.js
      </footer>
    </div>
  );
}
