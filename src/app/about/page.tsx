import { Header } from '@/components/Header';


export default function AboutPage() {
return (
<div className="min-h-screen bg-[#faf7f2] text-gray-900">
<Header />
<main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
<h1 className="text-3xl font-extrabold">About</h1>
<p className="mt-4 text-gray-700 leading-relaxed">
I’m Teresa, a computer science student who unwinds with yarn and a hook. This space is a logbook—what I’m trying,
what’s working, and the occasional pattern note.
</p>
</main>
</div>
);
}