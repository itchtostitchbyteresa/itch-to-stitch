import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://itchtostitchbyTeresa.com";
  return [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    ...POSTS.map(p => ({
      url: `${base}/posts/${p.slug}`,
      lastModified: new Date(p.date),
    })),
  ];
}