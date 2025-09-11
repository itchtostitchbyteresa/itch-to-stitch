import { Header } from '@/components/Header';


export default function ContactPage() {
return (
<div className="min-h-screen bg-[#faf7f2] text-gray-900">
<Header />
<main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
<h1 className="text-3xl font-extrabold">Contact</h1>
<p className="mt-4 text-gray-700">Questions or friendly yarn chat?</p>
<div className="mt-6 flex items-center gap-3">
<a href="mailto:you@example.com?subject=Hello%20from%20your%20blog" className="px-5 py-3 rounded-xl bg-black text-white">Email me</a>
</div>
</main>
</div>
);
}