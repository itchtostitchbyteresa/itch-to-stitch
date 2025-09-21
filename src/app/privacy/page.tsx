import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How data is collected and used on Itch To Stitch by Teresa.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy",
    description: "How data is collected and used on Itch To Stitch by Teresa.",
    type: "article",
    url: "/privacy",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Itch To Stitch by Teresa" }],
  },
  twitter: { card: "summary_large_image", title: "Privacy Policy", description: "How data is collected and used on Itch To Stitch by Teresa." },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-3xl mx-auto px-6 mt-8 mb-20">
        <article className="max-w-none">
          <h1 className="text-3xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.18] mt-2 mb-6">
            Privacy Policy
          </h1>

          <p className="text-gray-700 leading-8">
            This site shares crochet and cross-stitch notes, tutorials, and experiments. Below is what gets collected and why.
            If anything here feels unclear,{" "}
            <Link href="/contact" className="text-rose-900 underline">contact me</Link>.
          </p>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            What I collect
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-8">
            <li><strong>Comments (Supabase):</strong> your message, optional name, the post slug, and timestamps. No login required.</li>
            <li><strong>Email subscriptions (Buttondown):</strong> your email (double opt-in). Unsubscribe any time via the email footer.</li>
            <li><strong>Basic analytics (Vercel Analytics):</strong> privacy-respecting performance and traffic signals.</li>
          </ul>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Cookies, ads & consent
          </h2>
          <p className="text-gray-800 leading-8">
            Google AdSense may set cookies to serve and measure ads. For visitors in the EEA/UK/CH, a consent banner appears and
            your choice (accept/reject) is honored via Google Consent Mode. You can change your choice later using the link in the footer.
          </p>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Data sharing
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-8">
            <li>Comments are stored in Supabase.</li>
            <li>Email addresses for the newsletter are stored with Buttondown.</li>
            <li>Ad requests are handled by Google AdSense.</li>
          </ul>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Retention
          </h2>
          <p className="text-gray-800 leading-8">
            Comments remain unless moderated or deleted. Email addresses stay until you unsubscribe. Analytics are kept only as long as needed for trends.
          </p>

          <h2 className="text-2xl text-rose-900 [font-family:var(--font-pacifico)] font-normal leading-[1.22] mt-10 mb-4">
            Your choices
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-800 leading-8">
            <li>Unsubscribe from emails anytime (link in email footer).</li>
            <li>Request a comment removal via the <Link href="/contact" className="text-rose-900 underline">contact page</Link>.</li>
            <li>Update consent preferences using the footer link (EEA/UK/CH).</li>
          </ul>

          <p className="text-sm text-gray-500 leading-7 mt-10">Last updated: {new Date().toISOString().slice(0, 10)}</p>
        </article>
      </main>
    </div>
  );
}



