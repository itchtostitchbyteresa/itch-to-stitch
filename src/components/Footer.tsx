// /components/Footer.tsx
import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-rose-900 text-rose-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Top row: two columns, inline links */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: site nav, inline */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:text-base">
            <Link href="/" className="hover:underline hover:text-white">Home</Link>
            <Link href="/about" className="hover:underline hover:text-white">About</Link>
            <Link href="/contact" className="hover:underline hover:text-white">Contact</Link>
            <Link href="/tools/cross-stitch" className="hover:underline hover:text-white">
              Cross-Stitch Generator
            </Link>
          </nav>

          {/* Right: socials, inline */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:text-base">
            <a
              href="https://instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline hover:text-white"
            >
              {/* simple icon */}
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <path d="M16.5 7.5h.01" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              Instagram
            </a>
            <a
              href="https://www.pinterest.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-3.6 19.34c-.05-.82-.1-2.08.02-2.98.11-.74.72-4.69.72-4.69s-.18-.36-.18-.9c0-.85.49-1.49 1.1-1.49.52 0 .77.39.77.87 0 .53-.34 1.31-.52 2.04-.15.62.31 1.12.92 1.12 1.11 0 1.96-1.17 1.96-2.85 0-1.49-1.07-2.53-2.6-2.53-1.77 0-2.81 1.33-2.81 2.71 0 .54.21 1.12.47 1.44.05.06.06.11.05.17-.05.18-.16.57-.18.65-.03.1-.1.13-.23.08-.86-.38-1.4-1.57-1.4-2.52 0-2.06 1.5-3.95 4.34-3.95 2.28 0 4.05 1.63 4.05 3.82 0 2.26-1.42 4.08-3.4 4.08-.67 0-1.3-.35-1.52-.76l-.41 1.56c-.15.57-.55 1.29-.82 1.73A10 10 0 1 0 12 2Z"/>
              </svg>
              Pinterest
            </a>
            <a
              href="https://www.ravelry.com/people/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:underline hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <circle cx="12" cy="12" r="8" />
                <path d="M6 12c2-1 6-1 9 2" />
                <path d="M8 8c3 0 6 2 8 5" />
                <path d="M10 16c2-1 4-1 6 0" />
              </svg>
              Ravelry
            </a>
          </div>
        </div>

        {/* Bottom line, centered */}
        <p className="mt-3 text-center text-[13px] leading-5 text-rose-100">
          © {year} • Built with <span className="text-white">❤️</span> and{" "}
          <a
            href="https://nextjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white"
          >
            Next.js
          </a>
        </p>
      </div>
    </footer>
  );
}

