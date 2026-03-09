import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "アーティスト管理" };

export default async function AdminArtistsPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">アーティスト管理</h1>
        <Link
          href="/admin/artists/new"
          className="rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + アーティストを追加
        </Link>
      </div>

      {!artists || artists.length === 0 ? (
        <p className="text-sm text-muted-foreground">アーティストがいません</p>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">名前</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">英語名</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">スラッグ</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {artists.map((artist: any) => (
                <tr key={artist.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{artist.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                    {artist.name_en || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {artist.slug}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/artists/${artist.id}/edit`}
                      className="rounded border border-border px-3 py-1 text-xs hover:bg-accent transition-colors"
                    >
                      編集
                    </Link>
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
