import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : undefined;
  const supabaseAnonKey = typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : undefined;

  // Use placeholder values if environment variables are not set
  const url = supabaseUrl || "https://placeholder.supabase.co";
  const key = supabaseAnonKey || "placeholder-key";

  return createBrowserClient(url, key);
}




