// Keep your helpers + site constants here
export const SITE_TITLE = "Itch To Stitch by Teresa";
export const LOGO_URL = "/logo.png";

export function formatDateISO(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "short", day: "2-digit", timeZone: "UTC",
  }).format(d);
}

// Re-export POSTS from the content index
export type { Post } from "./types";
export { POSTS } from "@/content";

