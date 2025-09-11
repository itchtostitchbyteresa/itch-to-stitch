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
  slug: "fall-wreath-notes",
  title: "Autumn Wreath",
  date: "2024-10-04", // adjust to the day you publish
  tags: ["fall", "wreath", "inspiration","autumn"],
  excerpt:
    "A cozy circle of yarn and leaves — made with scraps, some online inspo, and a little trial and error.",
  cover:
    "https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757618999/owl_wreath_full_f5kpid.jpg",
  html: `
    <p>Autumn is my favorite season in Canada. I love the colors, the leaves scattered on the ground, those cozy colder evenings. So when I decided to make seasonal wreaths, I knew autumn needed to be the first one.</p>
    
    <div class="flex flex-col md:flex-row items-center gap-6 my-8">
    <img src="https://www.yarnspirations.com/cdn/shop/products/RHC0518-016288M.jpg?v=1687453231&width=1946"
     alt="Inspiration wreath"
     class="w-full md:w-1/3 rounded-xl" />

    <p class="text-gray-700 leading-relaxed">
    I used the Fabulous Fall Wreath as inspiration. You can get the pattern 
    for free on <a href="https://www.yarnspirations.com/en-ca/products/red-heart-fabulous-fall-wreath" target="_blank" class="underline text-rose-700 hover:text-rose-900">Yarnspirations.com</a>.</p>
</div>
  
<div class="flex flex-col md:flex-row items-center gap-6 my-8">
  <!-- Text on the left -->
  <div class="md:w-2/3">
    <p class="text-gray-700 leading-relaxed">
      For the frame, I used a simple <strong>metal wreath ring, 14 inches in diameter.</strong> 
      I grabbed mine at Dollarama, but you can find similar ones on 
      <a href="https://www.amazon.ca/Firlar-Wreath-Valentines-Wedding-Decoration/dp/B08T1M46N5/ref=asc_df_B08T1M46N5?mcid=1dd068fdea34393c9e1323b4495383e9&tag=googleshopc0c-20&linkCode=df0&hvadid=706725854862&hvpos=&hvnetw=g&hvrand=11067853612871393448&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9198282&hvtargid=pla-2321882202954&hvocijid=11067853612871393448-B08T1M46N5-&hvexpln=0&gad_source=1&th=1" target="_blank" class="underline text-rose-700 hover:text-rose-900">Amazon.ca</a>, or any online craft shop.
      To cover the base, I used a bulky cream yarn I’d found in a “mystery savings bag” at Value Village.I simply wrapped it all
    the way around the ring until it was covered. You could also crochet stitches around the frame if you prefer; the only thing that matters is that the entire base disappears under yarn so you have something cozy to build on.
      
    </p>
  </div>

  <!-- Image on the right -->
  <div class="md:w-1/3">
    <img 
      src="https://m.media-amazon.com/images/I/61NYFkJUxtL._AC_SX679_.jpg" 
      alt="Metal wreath ring" 
      class="rounded-xl w-full"
    />
  </div>
</div>

<p>For yarn, I used <strong>Loops & Threads Impeccable</strong> leftovers: <em>Red Hot, Pumpkin, Golden Beige, Forest, 
Lemon, Sunny Day,</em> and <em>Green Lagoon.</em> I worked everything with a <strong>4.5 mm hook</strong>, 
which gave me a good balance between structure and drape. I didn’t bother with gauge or matching the exact sizes from the inspiration pattern. 
I just made a leaf, liked how it looked, and kept going from there. </p>

 <div class="flex flex-col md:flex-row items-center gap-6 my-8">
    <img src="https://res.cloudinary.com/dl7fmgr2s/image/upload/v1757624162/details_enhanced_v4cehz.jpg"
     alt="Fall Wreath Details"
     class="w-full md:w-1/3 rounded-xl" />

    <p class="text-gray-700 leading-relaxed">
    My wreath has more of the <strong>five-point </strong> leaves and the <strong>grape </strong> leaves, and fewer of 
    the <strong>single-point</strong> style. That made it look a little busier and less neat than the original recipe, but 
    that was on purpose. I wanted it to feel full and slightly wild, like a bundle of real leaves. You could make different 
    choices with your leaf mix to get a tidier look more close to the original if that’s what you prefer.  For the <strong>acorns
     and the larger grapes</strong>, I used leftover yarn scraps, but you can use any filling you have on hand.
</p>
</div>

<p>And if you need more inspiration you can check
<a href="https://www.ravelry.com/patterns/library/fabulous-fall-wreath" target="_blank" 
class="underline text-rose-700 hover:text-rose-900">Ravelry.com</a> for other versions of this same wreath.</p>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
  <img 
    src="https://images4-a.ravelrycache.com/uploads/magicschoolmom/743577035/wreath_medium2.jpg?webp=0" 
    alt="Finished fall wreath" 
    class="rounded-xl w-full object-cover"
  />
  <img 
    src="https://images4-a.ravelrycache.com/uploads/estobella/470634653/Herbstkranz_medium2.JPG?webp=0" 
    alt="Close-up of leaves and acorns" 
    class="rounded-xl w-full object-cover"
  />
  <img 
    src="https://images4-a.ravelrycache.com/uploads/hollymarie7/737812600/upload_medium2?webp=0" 
    alt="Inspiration wreath" 
    class="rounded-xl w-full object-cover"
  />
</div>


  `,
},

];

export const ALL_TAGS: string[] = [
  "all",
  ...Array.from(new Set(POSTS.flatMap((p) => p.tags))),
];