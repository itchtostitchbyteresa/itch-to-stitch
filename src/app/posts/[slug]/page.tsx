import { notFound } from "next/navigation";
import { POSTS, formatDateISO, SITE_TITLE } from "@/lib/posts";
import { Header } from "@/components/Header";
import { Pacifico } from "next/font/google";
import Link from "next/link";
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
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
            className="rounded-xl mt-6"
          />
          {/* eslint-disable-next-line react/no-danger */}
          <div
            className="mt-6 text-gray-800"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </article>
        <div className="mt-10">
  <Link href="/" className="underline">
    ← Back to posts
  </Link>
</div>
      </main>
      <footer className="text-center text-xs text-gray-500 py-12">
        © {new Date().getFullYear()} {SITE_TITLE} • Built with ❤️ and Next.js
      </footer>
    </div>
  );
}
