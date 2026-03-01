import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  // 管理者チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bucket = formData.get("bucket") as string; // "stems" or "charts"
  const filePath = formData.get("filePath") as string;

  if (!file || !bucket || !filePath) {
    return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
  }

  const adminSupabase = createAdminClient();

  // ファイルをStorageにアップロード
  const { data, error } = await adminSupabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    path: data.path,
    fullPath: `${bucket}/${data.path}`,
  });
}
