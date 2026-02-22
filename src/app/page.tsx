import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-8 px-6">
          {/* Logo / Title */}
          <div className="space-y-3">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground">
              Worship Tracks for Japanese Churches
            </p>
            <h1 className="text-6xl sm:text-8xl font-black tracking-tight bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
              サントラ
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
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
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
          <div className="flex gap-12 justify-center pt-8 text-center">
            <div>
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">楽曲数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">ステム数</div>
            </div>
            <div>
              <div className="text-2xl font-bold">--</div>
              <div className="text-xs text-muted-foreground">登録教会</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 サントラ (Santra). All rights reserved.</p>
      </footer>
    </div>
  );
}
