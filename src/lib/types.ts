export type Post = {
  slug: string;
  title: string;
  date: string;        // ISO string
  updated?: string;
  tags: string[];
  excerpt: string;
  cover: string;       // image URL
  html: string;        // HTML body
};