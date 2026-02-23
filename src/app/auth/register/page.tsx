"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [churchName, setChurchName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    // 1. Supabase Auth でユーザー作成
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName, // トリガーで profiles.display_name に使われる
        },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "このメールアドレスは既に登録されています"
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    // 2. profiles テーブルの church_name を更新
    if (data.user && churchName) {
      await supabase
        .from("profiles")
        .update({ church_name: churchName })
        .eq("id", data.user.id);
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              サントラ
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            新規アカウント作成
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              表示名
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="田中 太郎"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="churchName" className="text-sm font-medium">
              教会名 <span className="text-muted-foreground font-normal">（任意）</span>
            </label>
            <input
              id="churchName"
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="○○教会"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "登録中..." : "アカウント作成"}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground">
          既にアカウントをお持ちの方は{" "}
          <Link
            href="/auth/login"
            className="text-violet-500 hover:text-violet-400 font-medium"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
