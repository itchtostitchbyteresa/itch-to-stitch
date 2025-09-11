import Link from "next/link";
import { LOGO_URL, SITE_TITLE } from "@/lib/posts";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

export function Header() {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-8">
      <div className="flex items-center justify-between">
        {/* Nav on the left now */}
        <nav className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">
            Home
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </nav>

        {/* Logo + title on the right */}
        <Link href="/" className="flex items-center gap-3">
        <span className={`text-2xl ${pacifico.className} text-rose-700`}>
            {SITE_TITLE}
          </span>
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-20 w-20 rounded-full border border-rose-200"
          />
      
        </Link>
      </div>
    </header>
  );
}
