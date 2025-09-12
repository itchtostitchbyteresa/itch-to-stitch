import type { Post } from "@/lib/types";
import fallWreath from "./posts/fall-wreath";
import toteBag from "./posts/mandala-tote-bag";

export const POSTS: Post[] = [
  fallWreath,
  toteBag,
  // grannySquare,
  // amigurumiWhale,
].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first