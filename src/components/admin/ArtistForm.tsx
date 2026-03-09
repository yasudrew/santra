"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ArtistFormProps = {
  artist?: any;
};

export default function ArtistForm({ artist }: ArtistFormProps) {
  const router = useRouter();
  const isEdit = !!artist;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(artist?.name || "");
  const [nameEn, setNameEn] = useState(artist?.name_en || "");
  const [slug, setSlug] = useState(artist?.slug || "");
  const [bio, setBio] = useState(artist?.bio || "");

  const handleNameEnChange = (value: string) => {
    setNameEn(value);
    if (!isEdit || !slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      name,
      name_en: nameEn || null,
      slug,
      bio: bio || null,
    };

    try {
      const url = isEdit ? `/api/admin/artists/${artist.id}` : "/api/admin/artists";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "保存に失敗しました");

      router.push("/admin/artists");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名前 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="賛美チーム東京"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">英語名</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              placeholder="Worship Team Tokyo"
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">スラッグ（URL用）*</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="worship-team-tokyo"
            required
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            URL: /artists/{slug || "..."}
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">プロフィール</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="アーティストの紹介文..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "保存中..." : isEdit ? "更新する" : "作成する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/artists")}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
