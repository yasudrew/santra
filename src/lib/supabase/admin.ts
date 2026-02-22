import { createClient } from "@supabase/supabase-js";

// ⚠️ サーバーサイドのみで使用！
// Service Role Key はRLSをバイパスするため、APIルートやWebhookでのみ使う
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
