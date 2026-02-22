import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, formatDuration, instrumentLabels } from "@/lib/utils";
import StemList from "@/components/songs/StemList";
import AddToCartButton from "@/components/songs/AddToCartButton";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: song } = await supabase
    .from("songs")
    .select("title, description")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!song) return { title: "楽曲が見つかりません" };

  return {
    title: song.title,
    description: song.description || `${song.title}のステムデータ`,
  };
}

export default async function SongDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: song } = await supabase
    .from("songs")
    .select(`
      *,
      artist:artists(name, slug, image_url),
      album:albums(title, slug, cover_image_url),
      stems(*),
      song_tags(tag:tags(name, slug))
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!song) {
    notFound();
  }

  const sortedStems = (song.stems || []).sort(
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/songs" className="hover:text-foreground transition-colors">
          楽曲
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{song.title}</span>
      </nav>

      {/* Song Header */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Cover Image */}
        <div className="w-full sm:w-48 h-48 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-border flex items-center justify-center flex-shrink-0">
          {song.cover_image_url ? (
            <img
              src={song.cover_image_url}
              alt={song.title}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-4xl">🎵</span>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{song.title}</h1>
            {song.title_en && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {song.title_en}
              </p>
            )}
          </div>

          {/* Artist */}
          {song.artist && (
            <Link
              href={`/artists/${song.artist.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                🎤
              </div>
              {song.artist.name}
            </Link>
          )}

          {/* Meta Info */}
          <div className="flex flex-wrap gap-3">
            {song.song_key && (
              <span className="inline-flex items-center rounded-md bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-xs font-medium text-violet-400">
                Key: {song.song_key}
              </span>
            )}
            {song.bpm && (
              <span className="inline-flex items-center rounded-md bg-fuchsia-500/10 border border-fuchsia-500/20 px-2.5 py-1 text-xs font-medium text-fuchsia-400">
                {song.bpm} BPM
              </span>
            )}
            {song.time_signature && (
              <span className="inline-flex items-center rounded-md bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-400">
                {song.time_signature}
              </span>
            )}
            {song.duration_seconds && (
              <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {formatDuration(song.duration_seconds)}
              </span>
            )}
          </div>

          {/* Tags */}
          {song.song_tags && song.song_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {song.song_tags.map((st: any) => (
                <Link
                  key={st.tag.slug}
                  href={`/songs?tag=${st.tag.slug}`}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  #{st.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-2xl font-bold">
              {formatPrice(song.price)}
            </span>
            <AddToCartButton song={song} />
          </div>
        </div>
      </div>

      {/* Description */}
      {song.description && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">概要</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {song.description}
          </p>
        </div>
      )}

      {/* Stem List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">
          収録ステム（{sortedStems.length}トラック）
        </h2>
        <StemList stems={sortedStems} />
      </div>

      {/* Lyrics */}
      {song.lyrics_text && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">歌詞</h2>
          <div className="rounded-xl border border-border bg-card p-6">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {song.lyrics_text}
            </pre>
          </div>
        </div>
      )}

      {/* Album Info */}
      {song.album && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">収録アルバム</h2>
          <div className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
              💿
            </div>
            <div>
              <p className="text-sm font-medium">{song.album.title}</p>
              {song.artist && (
                <p className="text-xs text-muted-foreground">
                  {song.artist.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
