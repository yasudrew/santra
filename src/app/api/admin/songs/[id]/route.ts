import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;

  // 管理者チェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { tag_ids, ...songData } = body;

  const adminSupabase = createAdminClient();

  // 楽曲を更新
  const { data: song, error } = await adminSupabase
    .from("songs")
    .update(songData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // タグを更新（削除→再挿入）
  await adminSupabase.from("song_tags").delete().eq("song_id", id);
  if (tag_ids && tag_ids.length > 0) {
    const songTags = tag_ids.map((tagId: string) => ({
      song_id: id,
      tag_id: tagId,
    }));
    await adminSupabase.from("song_tags").insert(songTags);
  }

  return NextResponse.json({ song });
}

export async function DELETE(request: Request, { params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase.from("songs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
