import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type SongCardProps = {
  song: {
    slug: string;
    title: string;
    title_en?: string;
    song_key?: string;
    bpm?: number;
    price: number;
    cover_image_url?: string;
    artist?: { name: string; slug: string } | null;
    album?: { title: string; cover_image_url?: string } | null;
    song_tags?: { tag: { name: string; slug: string } }[];
  };
};

export default function SongCard({ song }: SongCardProps) {
  return (
    <Link
      href={`/songs/${song.slug}`}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-violet-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/5"
    >
      {/* Cover Image */}
      <div className="aspect-square bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center relative overflow-hidden">
        {song.cover_image_url || song.album?.cover_image_url ? (
          <img
            src={song.cover_image_url || song.album?.cover_image_url}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-300">
            🎵
          </span>
        )}

        {/* Price Badge */}
        <div className="absolute top-3 right-3 rounded-lg bg-black/70 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-white">
          {formatPrice(song.price)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div>
          <h3 className="font-semibold text-sm group-hover:text-violet-400 transition-colors line-clamp-1">
            {song.title}
          </h3>
          {song.artist && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {song.artist.name}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2">
          {song.song_key && (
            <span className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-400">
              {song.song_key}
            </span>
          )}
          {song.bpm && (
            <span className="rounded bg-fuchsia-500/10 px-1.5 py-0.5 text-[10px] font-medium text-fuchsia-400">
              {song.bpm}BPM
            </span>
          )}
        </div>

        {/* Tags */}
        {song.song_tags && song.song_tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {song.song_tags.slice(0, 2).map((st) => (
              <span
                key={st.tag.slug}
                className="text-[10px] text-muted-foreground"
              >
                #{st.tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
