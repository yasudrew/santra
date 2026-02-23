import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ songId: string }>;
};

export async function GET(request: Request, { params }: Props) {
  const { songId } = await params;
  const { searchParams } = new URL(request.url);
  const stemId = searchParams.get("stemId");
  const allStems = searchParams.get("all") === "true";

  // 1. ユーザー認証
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "ログインが必要です" },
      { status: 401 }
    );
  }

  // 2. ダウンロード権限を確認
  const adminSupabase = createAdminClient();

  const { data: download, error: dlError } = await adminSupabase
    .from("downloads")
    .select("*")
    .eq("user_id", user.id)
    .eq("song_id", songId)
    .single();

  if (dlError || !download) {
    return NextResponse.json(
      { error: "この楽曲のダウンロード権限がありません" },
      { status: 403 }
    );
  }

  // 3. ダウンロード回数チェック
  if (download.download_count >= download.max_downloads) {
    return NextResponse.json(
      { error: `ダウンロード上限（${download.max_downloads}回）に達しました` },
      { status: 403 }
    );
  }

  // 4. ステム情報を取得
  let stems;
  if (allStems) {
    const { data, error } = await adminSupabase
      .from("stems")
      .select("*")
      .eq("song_id", songId)
      .order("sort_order");
    if (error || !data || data.length === 0) {
      return NextResponse.json(
        { error: "ステムデータが見つかりません" },
        { status: 404 }
      );
    }
    stems = data;
  } else if (stemId) {
    const { data, error } = await adminSupabase
      .from("stems")
      .select("*")
      .eq("id", stemId)
      .eq("song_id", songId)
      .single();
    if (error || !data) {
      return NextResponse.json(
        { error: "ステムデータが見つかりません" },
        { status: 404 }
      );
    }
    stems = [data];
  } else {
    return NextResponse.json(
      { error: "stemId または all パラメータが必要です" },
      { status: 400 }
    );
  }

  // 5. Supabase Storage からファイルを取得
  //    現在はダミーファイルなのでプレースホルダーを返す
  //    実際のファイルがStorageにアップされたら以下のコードを有効化:
  //
  //    const { data: fileData, error: fileError } = await adminSupabase
  //      .storage
  //      .from("stems")
  //      .download(stem.file_url);

  // 6. ダウンロード回数を更新
  await adminSupabase
    .from("downloads")
    .update({ download_count: download.download_count + 1 })
    .eq("id", download.id);

  // プレースホルダー: 実際のファイルがない場合はテキストファイルを返す
  const songInfo = await adminSupabase
    .from("songs")
    .select("title")
    .eq("id", songId)
    .single();

  const songTitle = songInfo.data?.title || "unknown";
  const stemNames = stems.map((s: any) => s.name).join(", ");

  const placeholder = `[サントラ] ダウンロードテスト成功！

楽曲: ${songTitle}
ステム: ${stemNames}
ダウンロード回数: ${download.download_count + 1} / ${download.max_downloads}

※ 実際の音源ファイルがSupabase Storageにアップロードされると、
   ここにWAVファイルが配信されます。`;

  const fileName = allStems
    ? `${songTitle}-all-stems.txt`
    : `${stems[0].name}.txt`;

  return new NextResponse(placeholder, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
    },
  });
}
