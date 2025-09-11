import Link from "next/link";
import { LOGO_URL, SITE_TITLE } from "@/lib/posts";
import { Pacifico } from "next/font/google";
import React from "react";

const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white/80 hover:bg-white hover:shadow transition"
      title={label}
    >
      {children}
    </a>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-6xl mx-auto px-6 py-3">
        {/* 3-column header: nav | socials | logo/title */}
        <div className="grid grid-cols-3 items-center">
          {/* Left: Nav (internal links use <Link/>) */}
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/about" className="hover:underline">About</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </nav>

          {/* Center: Socials */}
          <div className="flex justify-center items-center gap-3 text-rose-700">
            {/* Instagram */}
            <SocialLink href="https://instagram.com/yourhandle" label="Instagram">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M16.5 7.5h.01" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </SocialLink>
            {/* Pinterest */}
            <SocialLink href="https://www.pinterest.com/yourhandle" label="Pinterest">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.6 19.34c-.05-.82-.1-2.08.02-2.98.11-.74.72-4.69.72-4.69s-.18-.36-.18-.9c0-.85.49-1.49 1.1-1.49.52 0 .77.39.77.87 0 .53-.34 1.31-.52 2.04-.15.62.31 1.12.92 1.12 1.11 0 1.96-1.17 1.96-2.85 0-1.49-1.07-2.53-2.6-2.53-1.77 0-2.81 1.33-2.81 2.71 0 .54.21 1.12.47 1.44.05.06.06.11.05.17-.05.18-.16.57-.18.65-.03.1-.1.13-.23.08-.86-.38-1.4-1.57-1.4-2.52 0-2.06 1.5-3.95 4.34-3.95 2.28 0 4.05 1.63 4.05 3.82 0 2.26-1.42 4.08-3.4 4.08-.67 0-1.3-.35-1.52-.76l-.41 1.56c-.15.57-.55 1.29-.82 1.73A10 10 0 1 0 12 2Z"/>
              </svg>
            </SocialLink>
            {/* Ravelry (yarn ball-ish icon) */}
            <SocialLink href="https://www.ravelry.com/people/yourhandle" label="Ravelry">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="8" />
                <path d="M6 12c2-1 6-1 9 2" />
                <path d="M8 8c3 0 6 2 8 5" />
                <path d="M10 16c2-1 4-1 6 0" />
              </svg>
            </SocialLink>
          </div>

          {/* Right: Logo + Title */}
          <Link href="/" className="flex items-center gap-3 justify-end">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="h-16 w-16 rounded-full border border-rose-200"
            />
            <span className={`text-2xl ${pacifico.className} text-rose-700`}>
              {SITE_TITLE}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}