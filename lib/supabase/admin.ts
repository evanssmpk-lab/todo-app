import { createClient } from "@supabase/supabase-js";

// Service-role client: bypass RLS sepenuhnya. HANYA untuk dipakai di route
// yang tidak punya sesi cookie user (misal endpoint Shortcut), tidak pernah
// diimpor dari kode yang berjalan di browser.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
