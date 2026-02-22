import { createClient } from "@/lib/supabase/server";
import SongGrid from "@/components/songs/SongGrid";
import SongFilter from "@/components/songs/SongFilter";

export const metadata = {
  title: "楽曲一覧",
};

export default async function SongsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string; key?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  // 楽曲を取得（アーティスト情報も結合）
  let query = supabase
    .from("songs")
    .select(`
      *,
      artist:artists(name, slug),
      album:albums(title, cover_image_url),
      song_tags(tag:tags(name, slug))
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // 検索フィルター
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,title_en.ilike.%${params.q}%`);
  }

  // キーフィルター
  if (params.key) {
    query = query.eq("song_key", params.key);
  }

  const { data: songs, error } = await query;

  // タグフィルターはアプリ側で適用（Supabaseのネストフィルターは複雑なため）
  let filteredSongs = songs || [];
  if (params.tag) {
    filteredSongs = filteredSongs.filter((song: any) =>
      song.song_tags?.some((st: any) => st.tag?.slug === params.tag)
    );
  }

  // タグ一覧を取得（フィルターUI用）
  const { data: tags } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">楽曲</h1>
        <p className="text-muted-foreground mt-1">
          ハイクオリティなステムデータを探す
        </p>
      </div>

      {/* Filters */}
      <SongFilter tags={tags || []} />

      {/* Results */}
      <div className="mt-6">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {params.q || params.tag || params.key
                ? "条件に一致する楽曲が見つかりませんでした"
                : "楽曲がまだありません"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredSongs.length}曲
            </p>
            <SongGrid songs={filteredSongs} />
          </>
        )}
      </div>
    </div>
  );
}
