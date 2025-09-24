import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: { schema: "app" },
    auth: {
      // WICHTIG: PKCE + URL automatisch auswerten (code + code_verifier)
      flowType: "pkce",
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
    // Schema-Header zusätzlich erzwingen (robust gegen Caches)
    global: {
      headers: {
        "Accept-Profile": "app",
        "Content-Profile": "app",
        "X-Client-Info": "unterhaltpro-web-local",
      },
    },
  }
);
