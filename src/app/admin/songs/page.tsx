import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "楽曲管理" };

export default async function AdminSongsPage() {
  const supabase = await createClient();

  const { data: songs } = await supabase
    .from("songs")
    .select(`
      *,
      artist:artists(name),
      stems(id)
    `)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">楽曲管理</h1>
        <Link
          href="/admin/songs/new"
          className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + 楽曲を追加
        </Link>
      </div>

      {!songs || songs.length === 0 ? (
        <p className="text-sm text-muted-foreground">楽曲がありません</p>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">タイトル</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">アーティスト</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">ステム</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">価格</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">公開</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {songs.map((song: any) => (
                <tr key={song.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{song.title}</p>
                      {song.title_en && (
                        <p className="text-xs text-muted-foreground">{song.title_en}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {song.artist?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <span className="rounded bg-muted px-2 py-0.5 text-xs">
                      {song.stems?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(song.price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {song.is_published ? (
                      <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                        公開
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-500/10 text-zinc-400 px-2 py-0.5 text-xs font-medium">
                        下書き
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/songs/${song.id}/stems`}
                        className="rounded border border-border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        📁 ステム
                      </Link>
                      <Link
                        href={`/admin/songs/${song.id}/edit`}
                        className="rounded border border-border px-3 py-1 text-xs hover:bg-accent transition-colors"
                      >
                        編集
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
