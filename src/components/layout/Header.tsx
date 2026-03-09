"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CartButton from "@/components/cart/CartButton";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-black bg-gradient-to-r from-sky-500 to-teal-500 bg-clip-text text-transparent">
            <span className="font-[var(--font-mplus1p)]">賛美</span>
            <span className="font-[var(--font-inter)]">Tracks.com</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/songs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            楽曲
          </Link>
          <Link
            href="/artists"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            アーティスト
          </Link>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <CartButton />

          {/* Auth */}
          {loading ? (
            <div className="w-20 h-8 rounded-lg bg-muted animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 flex items-center justify-center text-xs text-white font-medium">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline text-muted-foreground">
                  {user.email?.split("@")[0]}
                </span>
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-lg border border-border bg-background shadow-lg py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      マイページ
                    </Link>
                    <Link
                      href="/dashboard/downloads"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      ダウンロード
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                    >
                      ログアウト
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ログイン
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                登録
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
