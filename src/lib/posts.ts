export type Post = {
  slug: string;
  title: string;
  date: string; // ISO date
  tags: string[];
  excerpt: string;
  cover: string; // image URL
  html: string; // HTML string for body
};

export const SITE_TITLE = "Itch To Stitch by Teresa";
export const LOGO_URL = "/logo.png";

// Deterministic date format to avoid hydration mismatches
export function formatDateISO(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

export const POSTS: Post[] = [
  {
    slug: "granny-square-basics",
    title: "Granny Square Basics",
    date: "2025-08-22",
    tags: ["tutorial", "granny square"],
    excerpt:
      "My go-to method for neat corners and a flat join, plus yarn choices I like for durable squares.",
    cover:
      "https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757607330/20200514_124755_g2ytco.jpg",
    html: `
      <p>Everyone has their way to start a square. I’m a <em>magic ring</em> person—less bulk, cleaner center.</p>
      <h3 class="text-lg font-semibold mt-6">Hook & yarn</h3>
      <p>I like a 4.0mm with DK cotton for bags; 5.0mm with worsted acrylic for blankets.</p>
      <h3 class="text-lg font-semibold mt-6">Rounds</h3>
      <ol class="list-decimal ml-6">
        <li>Ring + 3 ch (counts as dc), 2 dc, <code>ch 2</code>, repeat 3 more times. Join.</li>
        <li>In each corner: <code>3 dc, ch 2, 3 dc</code>. Sides: <code>3 dc</code>.</li>
        <li>Block your squares. Future-you will thank you.</li>
      </ol>
    `,
  },
  {
    slug: "fall-colors-palette",
    title: "Fall Colors Palette",
    date: "2025-09-05",
    tags: ["inspiration", "palette"],
    excerpt:
      "A cozy set of oranges, mauves, and soft yellow pulled from my sketchbook and stash.",
    cover:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    html: `
      <p>Matching yarns to moods is half the fun. Here’s a quick palette that pairs nicely with neutrals.</p>
      <ul class="list-disc ml-6">
        <li>Rust + peach for warmth</li>
        <li>Mauve + lilac for soft contrast</li>
        <li>Butter yellow as a quiet highlight</li>
      </ul>
    `,
  },
  {
    slug: "amigurumi-whale-notes",
    title: "Amigurumi Whale – Notes",
    date: "2025-09-09",
    tags: ["notes", "amigurumi"],
    excerpt: "Pattern tweaks I use for a rounder body and a less pointy tail.",
    cover:
      "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1600&auto=format&fit=crop",
    html: `
      <p>Short rows near the tail help the curve. I also stuff lightly to avoid hard edges.</p>
      <p>For eyes, I embroider with cotton thread—safer for babies, still cute.</p>
    `,
  },
];

export const ALL_TAGS: string[] = [
  "all",
  ...Array.from(new Set(POSTS.flatMap((p) => p.tags))),
];