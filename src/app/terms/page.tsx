// /app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Terms of Use",
  description: "Ground rules for using this site.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
      <h1 className="text-3xl font-extrabold text-rose-900">Terms of Use</h1>
      <p className="mt-4 text-gray-700 leading-relaxed">
        This blog is for sharing crochet notes and experiments. Content is provided “as is.”
        Use any ideas or snippets at your own risk.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-gray-900">Content & attribution</h2>
      <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
        <li>Unless otherwise noted, posts and photos are my own. Please link back if you share a snippet.</li>
        <li>Do not republish full posts or photos without permission.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-gray-900">Comments</h2>
      <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
        <li>Be kind. I may remove spam, hostile, or off-topic comments.</li>
        <li>By posting a comment you grant me permission to display it on the site.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-gray-900">Liability</h2>
      <p className="mt-3 text-gray-700">
        I’m not liable for losses or damages from using the site. External links are provided for convenience;
        I’m not responsible for their content.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-gray-900">Contact</h2>
      <p className="mt-3 text-gray-700">
        Questions about these terms? <Link href="/contact" className="text-rose-900 underline">Contact me</Link>.
      </p>
    </main>
  );
}
