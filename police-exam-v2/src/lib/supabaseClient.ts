import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fwigijxqyabcnblnqkec.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q28mzzJTlpuLRsYks3fLng_S4-HsWwU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
