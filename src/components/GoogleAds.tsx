// /components/GoogleAds.tsx
"use client";
import Script from "next/script";

export default function GoogleAds() {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4061217113594467" // ← your Publisher ID
      crossOrigin="anonymous"
    />
  );
}
