import { createClient } from "@supabase/supabase-js"

// Note: The NEXT_PUBLIC_SUPABASE_ANON_KEY provided in this project is actually a service role key.
// We use it here to initialize a standard supabase-js client that has admin capabilities.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
