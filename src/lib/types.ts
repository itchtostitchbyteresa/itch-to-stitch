export type Post = {
  slug: string;
  title: string;
  date: string;        // ISO string
  tags: string[];
  excerpt: string;
  cover: string;       // image URL
  html: string;        // HTML body
};