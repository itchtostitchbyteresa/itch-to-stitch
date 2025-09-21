// src/components/AdUnit.tsx
"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type Props = {
  /** Your AdSense slot id, e.g. "1234567890" */
  slot: string;
  /** Ad format */
  format?: "auto" | "rectangle" | "vertical" | "horizontal";
  /** Responsive setting (AdSense expects string "true"/"false") */
  responsive?: "true" | "false";
  /** Extra tailwind/classes */
  className?: string;
};

/**
 * Safe AdSense unit component.
 * - No TypeScript ignores
 * - Guards against SSR and HMR
 * - Provides minimal height to avoid "availableWidth=0" at mount
 */
export default function AdUnit({
  slot,
  format = "auto",
  responsive = "true",
  className = "",
}: Props) {
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!ref.current) return;

    // Ensure the ins has some initial size to avoid "availableWidth=0"
    // (use CSS too, but this helps on first paint)
    if (ref.current && ref.current.style.minHeight === "") {
      ref.current.style.minHeight = "250px";
      ref.current.style.minWidth = "300px";
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense can throw during dev/HMR; safe to ignore
    }
  }, [slot]);

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className}`}
      style={{ display: "block", minHeight: "250px" }}
      data-ad-client="ca-pub-4061217113594467" // ← your client id
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}

