"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  songId: string;
  currentUrl: string | null;
};

export default function ChartUploader({ songId, currentUrl }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      // 1. ファイルをStorageにアップロード
      const filePath = `${songId}/chord-chart.pdf`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "charts");
      formData.append("filePath", filePath);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || "アップロードに失敗しました");
      }

      const { path } = await uploadRes.json();

      // 2. songsテーブルの chord_chart_url を更新
      const updateRes = await fetch(`/api/admin/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chord_chart_url: path }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "更新に失敗しました");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("コード譜を削除しますか？")) return;

    setUploading(true);
    try {
      const updateRes = await fetch(`/api/admin/songs/${songId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chord_chart_url: null }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        throw new Error(data.error || "削除に失敗しました");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {currentUrl ? (
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-medium">コード譜アップロード済み</p>
              <p className="text-xs text-muted-foreground">{currentUrl}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="rounded border border-border px-3 py-1 text-xs hover:bg-accent transition-colors cursor-pointer">
              差し替え
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="rounded border border-border px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            コード譜PDFをアップロード
          </p>
          <label className="inline-block rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer">
            {uploading ? "アップロード中..." : "📄 PDFを選択"}
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
