import { Header } from '@/components/Header';


export default function AboutPage() {
return (
<div className="min-h-screen bg-[#faf7f2] text-gray-900">
<Header />
<main className="max-w-3xl mx-auto px-6 mt-12 mb-20">
<h1 className="text-3xl font-extrabold">About</h1>
<p className="mt-4 text-gray-700 leading-relaxed">
I’m Teresa. By day I study computer science; by night I chase stitches(or maybe the other way around). 
Here is where I park my crochet notes. Not polished tutorials—just what I tried, what I’d change, 
and why I’d do it again. I believe you can make good things without the “right” yarn or strict instructions. 
Patterns are a starting place, not a test. Your result will look different from the original—and that’s exactly why it’s yours.
</p>
</main>
</div>
);
}