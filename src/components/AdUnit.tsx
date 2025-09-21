"use client";

import { useEffect, useRef, useState } from "react";

// Minimal, resilient AdSense unit that avoids "No slot size for availableWidth=0"
export default function AdUnit({
  slot,
  className = "",
  format = "auto",
  client = "ca-pub-4061217113594467", // <-- your client id
  responsive = true,
}: {
  slot: string;
  className?: string;
  format?: "auto" | "fluid" | string;
  client?: string;
  responsive?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Mount only on client
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || !wrapRef.current) return;

    const ins = wrapRef.current.querySelector("ins.adsbygoogle") as HTMLElement | null;
    if (!ins) return;

    // Only push when width > 0
    const tryPush = () => {
      // If the element (or any parent) is display:none, offsetParent === null
      const visible = ins.offsetParent !== null && ins.offsetWidth > 0;
      if (!visible) return false;

      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* ignore */
      }
      return true;
    };

    // First attempt
    if (tryPush()) return;

    // Retry on size changes until it becomes visible
    const ro = new ResizeObserver(() => {
      if (tryPush()) ro.disconnect();
    });
    ro.observe(ins);

    // As a safety, also retry on window resize
    const onResize = () => tryPush();
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, slot]);

  return (
    <div ref={wrapRef} className={className} suppressHydrationWarning>
      {mounted && (
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          {...(responsive ? { "data-full-width-responsive": "true" } : {})}
        />
      )}
    </div>
  );
}
