import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const adminSupabase = createAdminClient();

  const { data: stem, error } = await adminSupabase
    .from("stems")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ stem });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const stemId = searchParams.get("id");

  if (!stemId) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // ステムのファイルURLを取得
  const { data: stem } = await adminSupabase
    .from("stems").select("file_url").eq("id", stemId).single();

  // Storageからファイル削除
  if (stem?.file_url) {
    await adminSupabase.storage.from("stems").remove([stem.file_url]);
  }

  // DBレコード削除
  const { error } = await adminSupabase.from("stems").delete().eq("id", stemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
