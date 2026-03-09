"use client";

import { useState } from "react";

type DownloadButtonProps = {
  songId: string;
  stemId?: string;
  stemName?: string;
  allStems?: boolean;
  chart?: boolean;
  disabled?: boolean;
};

export default function DownloadButton({
  songId,
  stemId,
  stemName,
  allStems,
  chart,
  disabled,
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const downloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "ダウンロードに失敗しました");
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const data = await response.json();
      if (data.downloadAll && data.stems) {
        for (const stem of data.stems) {
          await downloadFile(
            `/api/download/${songId}?stemId=${stem.id}`,
            `${stem.name}.wav`
          );
          await new Promise((r) => setTimeout(r, 500));
        }
        return;
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;

    const contentDisposition = response.headers.get("content-disposition");
    a.download = contentDisposition
      ? decodeURIComponent(
          contentDisposition.split("filename=")[1]?.replace(/"/g, "") || fileName
        )
      : fileName;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  };

  const handleDownload = async () => {
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (stemId) params.set("stemId", stemId);
      if (allStems) params.set("all", "true");
      if (chart) params.set("chart", "true");

      const url = `/api/download/${songId}?${params.toString()}`;
      const defaultName = chart
        ? "chord-chart.pdf"
        : allStems
        ? "all-stems"
        : `${stemName || "stem"}.wav`;

      await downloadFile(url, defaultName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (chart) {
    return (
      <div className="space-y-1">
        <button
          onClick={handleDownload}
          disabled={disabled || loading}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? "準備中..." : "📄 コード譜をダウンロード"}
        </button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  if (allStems) {
    return (
      <div className="space-y-1">
        <button
          onClick={handleDownload}
          disabled={disabled || loading}
          className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "ダウンロード中..." : "📦 全ステムをダウンロード"}
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
