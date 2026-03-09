import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SongGrid from "@/components/songs/SongGrid";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: artist } = await supabase
    .from("artists")
    .select("name, bio")
    .eq("slug", slug)
    .single();

  if (!artist) return { title: "アーティストが見つかりません" };

  return {
    title: artist.name,
    description: artist.bio || `${artist.name}の楽曲一覧`,
  };
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // アーティスト情報を取得
  const { data: artist } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!artist) {
    notFound();
  }

  // アーティストの楽曲を取得
  const { data: songs } = await supabase
    .from("songs")
    .select(`
      *,
      artist:artists(name, slug),
      album:albums(title, cover_image_url),
      song_tags(tag:tags(name, slug))
    `)
    .eq("artist_id", artist.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link
          href="/artists"
          className="hover:text-foreground transition-colors"
        >
          アーティスト
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{artist.name}</span>
      </nav>

      {/* Artist Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
          {artist.image_url ? (
            <img
              src={artist.image_url}
              alt={artist.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-4xl">🎤</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{artist.name}</h1>
          {artist.name_en && (
            <p className="text-sm text-muted-foreground">{artist.name_en}</p>
          )}
          {artist.bio && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              {artist.bio}
            </p>
          )}
        </div>
      </div>

      {/* Songs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          楽曲（{songs?.length || 0}曲）
        </h2>
        {songs && songs.length > 0 ? (
          <SongGrid songs={songs} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              まだ楽曲が登録されていません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
