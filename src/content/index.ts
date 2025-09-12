import type { Post } from "@/lib/types";
import fallWreath from "./posts/fall-wreath";

export const POSTS: Post[] = [
  fallWreath,
  // grannySquare,
  // amigurumiWhale,
].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first