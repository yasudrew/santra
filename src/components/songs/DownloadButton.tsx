"use client";

import { useState } from "react";

type DownloadButtonProps = {
  songId: string;
  stemId?: string;
  stemName?: string;
  allStems?: boolean;
  disabled?: boolean;
};

export default function DownloadButton({
  songId,
  stemId,
  stemName,
  allStems,
  disabled,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (stemId) params.set("stemId", stemId);
      if (allStems) params.set("all", "true");

      const response = await fetch(
        `/api/download/${songId}?${params.toString()}`
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "ダウンロードに失敗しました");
      }

      // ファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // ファイル名を取得
      const contentDisposition = response.headers.get("content-disposition");
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : allStems
        ? `${songId}-all-stems.zip`
        : `${stemName || "stem"}.wav`;

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (allStems) {
    return (
      <div className="space-y-1">
        <button
          onClick={handleDownload}
          disabled={disabled || loading}
          className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "準備中..." : "📦 全ステムをダウンロード"}
        </button>
        {error && (
          <p className="text-xs text-destructive text-center">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        onClick={handleDownload}
        disabled={disabled || loading}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "📥 DL"}
      </button>
    </div>
  );
}
