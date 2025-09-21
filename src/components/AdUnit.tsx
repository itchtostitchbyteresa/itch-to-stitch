// src/components/AdUnit.tsx
"use client";

import { useEffect, useRef } from "react";

type AdsByGoogleArray = {
  push: (params?: Record<string, unknown>) => void;
}[];

declare global {
  interface Window {
    adsbygoogle?: AdsByGoogleArray;
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
 * - Typed, no `any`
 * - Guards SSR/HMR
 * - Gives the slot a minimum size so AdSense doesn't see width=0
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

    // Minimum dimensions help avoid "availableWidth=0"
    if (ref.current.style.minHeight === "") {
      ref.current.style.minHeight = "250px";
      ref.current.style.minWidth = "300px";
    }

    try {
      const ads = (window.adsbygoogle = (window.adsbygoogle || []) as AdsByGoogleArray);
      ads.push({
          push: function (params?: Record<string, unknown>): void {
              throw new Error("Function not implemented.");
          }
      });
    } catch {
      // dev/HMR can throw; safe to ignore
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
