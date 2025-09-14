import type { Post } from "@/lib/types";
import fallWreath from "./posts/fall-wreath";
import toteBag from "./posts/mandala-tote-bag";
import sunflowerPillow from "./posts/sunflower-pillow";

export const POSTS: Post[] = [
  fallWreath,
  toteBag,
  sunflowerPillow,
  // grannySquare,
  // amigurumiWhale,
].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first