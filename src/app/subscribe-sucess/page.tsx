import Link from "next/link";
import { Header } from "@/components/Header";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-gray-900">
      <Header />
      <main className="max-w-xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-rose-700">You’re on the list! 🎉</h1>
        <p className="mt-4 text-gray-700">
          Check your email to confirm your subscription. If it’s not there, peek at spam/promotions.
        </p>
        <Link href="/" className="inline-block mt-8 underline">
          Back to home
        </Link>
      </main>
    </div>
  );
}