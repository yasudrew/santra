"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/CartProvider";

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();
  const cleared = useRef(false);

  // 決済完了後にカートをクリア（1回だけ実行）
  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-xl border border-border bg-card p-8 space-y-6">
        <div className="text-5xl">🎉</div>
        <div>
          <h1 className="text-xl font-bold">ご購入ありがとうございます！</h1>
          <p className="text-sm text-muted-foreground mt-2">
            決済が完了しました。購入した楽曲はマイページからダウンロードできます。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            マイページでダウンロード
          </Link>
          <Link
            href="/songs"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            楽曲を探す
          </Link>
        </div>
      </div>
    </div>
  );
}