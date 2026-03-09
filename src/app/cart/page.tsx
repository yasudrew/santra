"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice, itemCount } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    setError("");
    setLoading(true);

    // ログイン確認
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login?redirect=/cart");
      return;
    }

    try {
      // Stripe Checkout Session を作成
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            song_id: item.id,
            title: item.title,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      // Stripe の決済ページにリダイレクト
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h1 className="text-xl font-bold mb-2">カートは空です</h1>
        <p className="text-sm text-muted-foreground mb-6">
          楽曲を追加してください
        </p>
        <Link
          href="/songs"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          楽曲を探す
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">カート（{itemCount}曲）</h1>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* Cart Items */}
      <div className="rounded-xl border border-border bg-card divide-y divide-border mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            {/* Cover */}
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-sky-500/10 to-teal-500/10 flex items-center justify-center flex-shrink-0">
              {item.cover_image_url ? (
                <img
                  src={item.cover_image_url}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl">🎵</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/songs/${item.slug}`}
                className="text-sm font-medium hover:text-sky-400 transition-colors line-clamp-1"
              >
                {item.title}
              </Link>
              <p className="text-xs text-muted-foreground">{item.artist_name}</p>
            </div>

            {/* Price */}
            <div className="text-sm font-semibold flex-shrink-0">
              {formatPrice(item.price)}
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.id)}
              className="text-muted-foreground hover:text-destructive transition-colors text-lg flex-shrink-0"
              title="削除"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">小計</span>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-bold">
          <span>合計</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-4 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "処理中..." : `${formatPrice(totalPrice)} で購入する`}
        </button>

        <button
          onClick={clearCart}
          className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          カートを空にする
        </button>
      </div>
    </div>
  );
}
