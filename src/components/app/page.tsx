import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SongGrid from "@/components/songs/SongGrid";

export default async function Home() {
  const supabase = await createClient();

  // 最新の公開楽曲を取得
  const { data: songs } = await supabase
    .from("songs")
    .select(`
      *,
      artist:artists(name, slug),
      album:albums(title, cover_image_url),
      song_tags(tag:tags(name, slug))
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(8);

  // アーティスト数を取得
  const { count: artistCount } = await supabase
    .from("artists")
    .select("*", { count: "exact", head: true });

  // 楽曲数を取得
  const { count: songCount } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  // ステム数を取得
  const { count: stemCount } = await supabase
    .from("stems")
    .select("*", { count: "exact", head: true });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center space-y-8">
          <div className="space-y-3">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
              Worship Tracks for Japanese Churches
            </p>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
              <span className="font-[var(--font-mplus1p)]">賛美</span>
              <span className="font-[var(--font-inter)]">Tracks.com</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              ハイクオリティなステムデータで、
              <br />
              あなたの教会でも豊かな賛美を。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/songs"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              楽曲を探す
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-lg border border-border px-8 py-3 text-sm font-medium hover:bg-accent transition-colors"
            >
              無料で始める
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-12 justify-center pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{songCount || 0}</div>
              <div className="text-xs text-muted-foreground">楽曲数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stemCount || 0}</div>
              <div className="text-xs text-muted-foreground">ステム数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{artistCount || 0}</div>
              <div className="text-xs text-muted-foreground">アーティスト</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            3ステップで礼拝が変わる
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "🎵",
                title: "楽曲を選ぶ",
                desc: "キー、BPM、ジャンルから教会に合った楽曲を見つける",
              },
              {
                step: "02",
                icon: "💳",
                title: "ステムを購入",
                desc: "必要な楽曲のステムデータをダウンロード購入",
              },
              {
                step: "03",
                icon: "🎧",
                title: "礼拝で使う",
                desc: "GarageBandやDTMソフトで再生。足りないパートを補完",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="text-4xl">{item.icon}</div>
                <div className="text-xs font-mono text-sky-500">
                  STEP {item.step}
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Songs */}
      {songs && songs.length > 0 && (
        <section className="py-16 border-t border-border/40">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">最新の楽曲</h2>
              <Link
                href="/songs"
                className="text-sm text-sky-500 hover:text-sky-400 transition-colors"
              >
                すべて見る →
              </Link>
            </div>
            <SongGrid songs={songs} />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-6">
          <h2 className="text-2xl font-bold">
            あなたの教会の賛美を、
            <br />
            もっと豊かに。
          </h2>
          <p className="text-muted-foreground text-sm">
            奏者が足りなくても大丈夫。プロクオリティのステムデータが、
            <br className="hidden sm:block" />
            あなたの教会の礼拝を力強くサポートします。
          </p>
          <Link
            href="/songs"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            楽曲を探す
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 賛美Tracks.com. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/songs"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              楽曲
            </Link>
            <Link
              href="/artists"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              アーティスト
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
