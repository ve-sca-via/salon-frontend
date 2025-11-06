import { createClient } from "@supabase/supabase-js";

// --- Load environment variables ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- Validate configuration ---
const isDev = import.meta.env.MODE === "development";

// Only log details in development
if (isDev) {
  console.log("🟢 Supabase Config:", {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyPreview: supabaseAnonKey
      ? `${supabaseAnonKey.substring(0, 12)}...`
      : "❌ MISSING",
  });
}

// Show clear error if credentials missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL: Supabase credentials not loaded from .env.local");
  console.error(
    "👉 Please check your .env file and restart the dev server (Ctrl+C → npm run dev)"
  );

  // In production, crash early to avoid undefined behavior
  if (!isDev) {
    throw new Error("Supabase credentials missing in production build!");
  }
}

// --- Create a single Supabase client instance ---
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Utility to check config health ---
export const isSupabaseConfigured = () => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    !supabaseUrl.includes("your_supabase_url_here") &&
    !supabaseAnonKey.includes("your_supabase_anon_key_here")
  );
};

// --- Optional: helper for easier mocking in tests ---
export const getSupabase = () => supabase;
