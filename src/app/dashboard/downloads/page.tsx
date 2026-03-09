import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DownloadButton from "@/components/songs/DownloadButton";

export const metadata = {
  title: "ダウンロード",
};

export default async function DownloadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // ダウンロード権限のある楽曲を取得
  const { data: downloads } = await supabase
    .from("downloads")
    .select(`
      *,
      song:songs(
        id, title, slug, song_key, bpm, chord_chart_url,
        artist:artists(name),
        stems(id, name, instrument_type, sort_order)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          マイページ
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">ダウンロード</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">ダウンロード</h1>
      <p className="text-sm text-muted-foreground mb-8">
        購入した楽曲のステムデータとコード譜をダウンロードできます
      </p>

      {!downloads || downloads.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-4xl mb-3">📥</p>
          <p className="text-muted-foreground text-sm">
            ダウンロード可能な楽曲がありません
          </p>
          <Link
            href="/songs"
            className="inline-block mt-4 rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            楽曲を探す
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {downloads.map((dl: any) => {
            const song = dl.song;
            if (!song) return null;

            const sortedStems = (song.stems || []).sort(
              (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
            );

            const isMaxed = dl.download_count >= dl.max_downloads;

            return (
              <div
                key={dl.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Song Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center">
                      <span className="text-xl">🎵</span>
                    </div>
                    <div>
                      <Link
                        href={`/songs/${song.slug}`}
                        className="font-semibold hover:text-sky-400 transition-colors"
                      >
                        {song.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground">
                          {song.artist?.name}
                        </p>
                        {song.song_key && (
                          <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-medium text-sky-400">
                            {song.song_key}
                          </span>
                        )}
                        {song.bpm && (
                          <span className="rounded bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-medium text-teal-400">
                            {song.bpm}BPM
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      DL: {dl.download_count} / {dl.max_downloads}
                    </p>
                    {isMaxed && (
                      <p className="text-[10px] text-destructive mt-0.5">上限に達しました</p>
                    )}
                  </div>
                </div>

                {/* Chord Chart */}
                {song.chord_chart_url && (
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-amber-500/5">
                    <div className="flex items-center gap-3">
                      <span className="text-sm">📄</span>
                      <span className="text-sm font-medium">コード譜（PDF）</span>
                    </div>
                    <DownloadButton
                      songId={song.id}
                      chart
                      disabled={isMaxed}
                    />
                  </div>
                )}

                {/* Stems */}
                <div className="divide-y divide-border">
                  {sortedStems.map((stem: any) => (
                    <div
                      key={stem.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm">{stem.name}</span>
                        <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.5">
                          {stem.instrument_type}
                        </span>
                      </div>
                      <DownloadButton
                        songId={song.id}
                        stemId={stem.id}
                        stemName={stem.name}
                        disabled={isMaxed}
                      />
                    </div>
                  ))}
                </div>

                {/* Download All */}
                <div className="px-5 py-3 bg-muted/30 border-t border-border">
                  <DownloadButton
                    songId={song.id}
                    allStems
                    disabled={isMaxed}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
