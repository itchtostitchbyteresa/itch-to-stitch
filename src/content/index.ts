import type { Post } from "@/lib/types";
import fallWreath from "./posts/fall-wreath";
import toteBag from "./posts/tote-bag";
import sunflowerPillow from "./posts/sunflower-pillow";
import mandalaWallDecor from "./posts/mandala-wall-decor";
import toteBagNeverending from "./posts/tote-bag-neverending";

export const POSTS: Post[] = [
  fallWreath,
  toteBag,
  sunflowerPillow,
  mandalaWallDecor,
  toteBagNeverending,
  // amigurumiWhale,
].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first