import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "アーティスト",
};

export default async function ArtistsPage() {
  const supabase = await createClient();

  const { data: artists } = await supabase
    .from("artists")
    .select("*")
    .order("name");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">アーティスト</h1>
        <p className="text-muted-foreground mt-1">
          賛美トラックを提供するアーティスト
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {artists?.map((artist) => (
          <Link
            key={artist.id}
            href={`/artists/${artist.slug}`}
            className="group rounded-xl border border-border bg-card p-6 text-center hover:border-sky-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/5"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              {artist.image_url ? (
                <img
                  src={artist.image_url}
                  alt={artist.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-3xl">🎤</span>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-sky-400 transition-colors">
              {artist.name}
            </h3>
            {artist.name_en && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {artist.name_en}
              </p>
            )}
          </Link>
        ))}
      </div>

      {(!artists || artists.length === 0) && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            アーティストがまだ登録されていません
          </p>
        </div>
      )}
    </div>
  );
}
