import type { Post } from "@/lib/types";
import fallWreath from "./posts/fall-wreath";
import toteBag from "./posts/tote-bag";
import sunflowerPillow from "./posts/sunflower-pillow";
import mandalaWallDecor from "./posts/mandala-wall-decor";
import toteBagNeverending from "./posts/tote-bag-neverending";
import fridgeMagnetFall from"./posts/fall-fridge-magnet";

export const POSTS: Post[] = [
  fallWreath,
  toteBag,
  sunflowerPillow,
  mandalaWallDecor,
  toteBagNeverending,
  fridgeMagnetFall,
  // amigurumiWhale,
].sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first