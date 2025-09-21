import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Ground rules for using this site.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Use",
    description: "Ground rules for using this site.",
    type: "article",
    url: "/terms",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Itch To Stitch by Teresa" }],
  },
  twitter: { card: "summary_large_image", title: "Terms of Use", description: "Ground rules for using this site." },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 mt-8 mb-20">
        <article className="max-w-none">
          <h1 className="text-3xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.18] mt-2 mb-6">
            Terms of Use
          </h1>

          <p className="text-gray-700 leading-8">
            This blog shares crochet notes and cozy experiments. Content is provided “as is.” Use ideas at your own discretion.
          </p>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Content & attribution
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-8">
            <li>Unless noted, posts and photos are my own. Please link back if you quote or share a snippet.</li>
            <li>Do not republish full posts or photos without permission.</li>
          </ul>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Comments
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-8">
            <li>Be kind. I may remove spam, hostile, or off-topic comments.</li>
            <li>By posting a comment you grant permission to display it on the site.</li>
          </ul>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Liability
          </h2>
          <p className="text-gray-800 leading-8">
            I’m not liable for losses or damages from using the site. External links are provided for convenience; I’m not responsible for their content.
          </p>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Contact
          </h2>
          <p className="text-gray-800 leading-8">
            Questions about these terms?{" "}
            <Link href="/contact" className="text-rose-900 underline">Contact me</Link>. See also the{" "}
            <Link href="/privacy" className="text-rose-900 underline">Privacy Policy</Link>.
          </p>

          <p className="text-sm text-gray-500 leading-7 mt-10">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        </article>
      </main>
    </div>
  );
}

