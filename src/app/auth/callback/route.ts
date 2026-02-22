import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OAuth コールバック処理（Google等のログイン後にここにリダイレクトされる）
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  // エラー時はログインページへ
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
