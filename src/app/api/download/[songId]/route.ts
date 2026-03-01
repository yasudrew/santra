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
  const chart = searchParams.get("chart") === "true";

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

  const adminSupabase = createAdminClient();

  // 2. ダウンロード権限を確認
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

  // 4. コード譜ダウンロード
  if (chart) {
    const { data: song } = await adminSupabase
      .from("songs")
      .select("title, chord_chart_url")
      .eq("id", songId)
      .single();

    if (!song?.chord_chart_url) {
      return NextResponse.json(
        { error: "コード譜が登録されていません" },
        { status: 404 }
      );
    }

    // Storageからダウンロード
    const { data: fileData, error: fileError } = await adminSupabase.storage
      .from("charts")
      .download(song.chord_chart_url);

    if (fileError || !fileData) {
      return NextResponse.json(
        { error: "ファイルの取得に失敗しました" },
        { status: 500 }
      );
    }

    const fileName = `${song.title}-コード譜.pdf`;
    const arrayBuffer = await fileData.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  }

  // 5. ステム情報を取得
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
      { error: "stemId, all, または chart パラメータが必要です" },
      { status: 400 }
    );
  }

  // 6. 単一ステムの場合、Storageからファイルを取得
  if (stems.length === 1) {
    const stem = stems[0];

    const { data: fileData, error: fileError } = await adminSupabase.storage
      .from("stems")
      .download(stem.file_url);

    if (fileError || !fileData) {
      // ファイルがStorageにない場合はプレースホルダーを返す
      const songInfo = await adminSupabase
        .from("songs").select("title").eq("id", songId).single();
      const placeholder = `[サントラ] ${songInfo.data?.title || ""} - ${stem.name}\n\n※ 音源ファイルが未アップロードです`;

      await adminSupabase
        .from("downloads")
        .update({ download_count: download.download_count + 1 })
        .eq("id", download.id);

      return new NextResponse(placeholder, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${encodeURIComponent(stem.name)}.txt"`,
        },
      });
    }

    // ダウンロード回数を更新
    await adminSupabase
      .from("downloads")
      .update({ download_count: download.download_count + 1 })
      .eq("id", download.id);

    const arrayBuffer = await fileData.arrayBuffer();
    const fileName = `${stem.name}.wav`;

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  }

  // 7. 全ステムの場合（複数ファイル → 1つずつのDLリンクをJSON返却）
  //    ※ ZIP化は複雑なので、フロントエンドで1つずつダウンロードする方式
  await adminSupabase
    .from("downloads")
    .update({ download_count: download.download_count + 1 })
    .eq("id", download.id);

  const stemList = stems.map((s: any) => ({
    id: s.id,
    name: s.name,
    instrument_type: s.instrument_type,
  }));

  return NextResponse.json({ stems: stemList, downloadAll: true });
}
