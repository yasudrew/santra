import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSのクラス名を安全にマージするユーティリティ
 * 使用例: cn("px-4 py-2", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 価格を日本円フォーマットで表示
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
  }).format(price);
}

/**
 * 秒数を mm:ss 形式に変換
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 日本語の楽器名マッピング
 */
export const instrumentLabels: Record<string, string> = {
  drums: "ドラム",
  bass: "ベース",
  keys: "キーボード",
  guitar: "ギター",
  synth: "シンセ",
  strings: "ストリングス",
  vocals: "ボーカル",
  click: "クリック",
  guide: "ガイド",
};
