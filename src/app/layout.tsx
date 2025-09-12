import "./globals.css";
import type { Metadata } from "next";
import { Nunito, Pacifico } from "next/font/google";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-body" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-brand" });

const siteName = "Itch To Stitch by Teresa";
const siteUrl = "https://itchtostitchbyTeresa.com"; 

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: "%s • Itch To Stitch",
  },
  description: "Crochet notes, tutorials, and cozy experiments.",
  openGraph: {
    type: "website",
    siteName,
    url: siteUrl,
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: siteName }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans bg-[#faf7f2]`}>
        {children}
      </body>
    </html>
  );
}

