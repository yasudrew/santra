import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StemUploader from "@/components/admin/StemUploader";
import ChartUploader from "@/components/admin/ChartUploader";

export const metadata = { title: "ステム管理" };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function StemManagementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: song } = await supabase
    .from("songs")
    .select("*, stems(*)")
    .eq("id", id)
    .single();

  if (!song) notFound();

  const sortedStems = (song.stems || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/admin/songs" className="hover:text-foreground transition-colors">
          楽曲管理
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/admin/songs/${id}/edit`} className="hover:text-foreground transition-colors">
          {song.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">ステム管理</span>
      </nav>

      <h1 className="text-2xl font-bold mb-2">{song.title}</h1>
      <p className="text-sm text-muted-foreground mb-8">ステムファイルとコード譜の管理</p>

      {/* Chord Chart Upload */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">コード譜（PDF）</h2>
        <ChartUploader songId={song.id} currentUrl={song.chord_chart_url} />
      </div>

      {/* Stem Upload */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          ステムファイル（{sortedStems.length}トラック）
        </h2>
        <StemUploader songId={song.id} songSlug={song.slug} stems={sortedStems} />
      </div>
    </div>
  );
}
