"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INSTRUMENT_TYPES = [
  { value: "drums", label: "ドラム" },
  { value: "bass", label: "ベース" },
  { value: "keys", label: "キーボード" },
  { value: "guitar", label: "ギター" },
  { value: "synth", label: "シンセ" },
  { value: "strings", label: "ストリングス" },
  { value: "vocals", label: "ボーカル" },
  { value: "click", label: "クリック" },
  { value: "guide", label: "ガイド" },
];

type Stem = {
  id: string;
  name: string;
  instrument_type: string;
  file_url: string;
  file_size_bytes?: number;
  sort_order: number;
};

type Props = {
  songId: string;
  songSlug: string;
  stems: Stem[];
};

export default function StemUploader({ songId, songSlug, stems }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 新規アップロード用の状態
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("drums");
  const [newFile, setNewFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newName) return;

    setError("");
    setUploading(true);

    try {
      // 1. ファイルをStorageにアップロード
      const filePath = `${songSlug}/${newType}-${Date.now()}.wav`;
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("bucket", "stems");
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

      // 2. DBにステムレコードを作成
      const stemRes = await fetch("/api/admin/stems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_id: songId,
          name: newName,
          instrument_type: newType,
          file_url: path,
          file_size_bytes: newFile.size,
          sort_order: stems.length + 1,
        }),
      });

      if (!stemRes.ok) {
        const data = await stemRes.json();
        throw new Error(data.error || "ステムの作成に失敗しました");
      }

      // リセット
      setNewName("");
      setNewFile(null);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (stemId: string) => {
    if (!confirm("このステムを削除しますか？")) return;

    setDeleting(stemId);
    try {
      const res = await fetch(`/api/admin/stems?id=${stemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent";

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Existing Stems */}
      {stems.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
          {stems.map((stem) => (
            <div
              key={stem.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 text-center">
                  {stem.sort_order}
                </span>
                <div>
                  <p className="text-sm font-medium">{stem.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-muted-foreground rounded bg-muted px-1.5 py-0.5">
                      {stem.instrument_type}
                    </span>
                    {stem.file_size_bytes && (
                      <span className="text-[10px] text-muted-foreground">
                        {(stem.file_size_bytes / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-400">
                      ✓ アップロード済み
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(stem.id)}
                disabled={deleting === stem.id}
                className="rounded border border-border px-3 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {deleting === stem.id ? "..." : "削除"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload New Stem */}
      <form
        onSubmit={handleUpload}
        className="rounded-xl border border-dashed border-border bg-card p-6 space-y-4"
      >
        <h3 className="text-sm font-semibold">新しいステムを追加</h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium">ステム名 *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ドラム"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">楽器タイプ *</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              className={inputClass}
            >
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">WAVファイル *</label>
            <input
              type="file"
              accept=".wav,.mp3,.aiff,.flac"
              onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:opacity-90"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !newFile || !newName}
          className="rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
      </form>
    </div>
  );
}
