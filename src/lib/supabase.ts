import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error("Missing Supabase env vars (URL/key). Set them in Vercel → Settings → Environment Variables.");
}

export const supabase = createClient(url, key);

