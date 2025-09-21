// /app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico" });

const siteName = "Itch To Stitch by Teresa";
const siteUrl = "https://itchtostitchbyteresa.com"; // use your real domain

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: "%s • Itch To Stitch" },
  description: "Crochet notes, tutorials, and cozy experiments.",
  openGraph: {
    type: "website",
    siteName,
    url: siteUrl,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: siteName }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: siteUrl },
  // If Google asks for site verification, put the code here:
  // verification: { google: "YOUR_VERIFICATION_CODE" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* AdSense loader (replace with your client id) */}
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4061217113594467"
        />
      </head>
      <body className={`${nunito.variable} ${pacifico.variable} font-sans bg-[#faf7f2]`}>
        {/* Make footer global and stick it to the bottom */}
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
