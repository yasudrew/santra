"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Artist = { id: string; name: string };
type Album = { id: string; title: string };
type Tag = { id: string; name: string; slug: string };

type SongFormProps = {
  song?: any;
  artists: Artist[];
  albums: Album[];
  tags: Tag[];
  selectedTagIds?: string[];
};

export default function SongForm({
  song,
  artists,
  albums,
  tags,
  selectedTagIds = [],
}: SongFormProps) {
  const router = useRouter();
  const isEdit = !!song;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(song?.title || "");
  const [titleEn, setTitleEn] = useState(song?.title_en || "");
  const [slug, setSlug] = useState(song?.slug || "");
  const [artistId, setArtistId] = useState(song?.artist_id || "");
  const [albumId, setAlbumId] = useState(song?.album_id || "");
  const [description, setDescription] = useState(song?.description || "");
  const [bpm, setBpm] = useState(song?.bpm?.toString() || "");
  const [songKey, setSongKey] = useState(song?.song_key || "");
  const [timeSignature, setTimeSignature] = useState(song?.time_signature || "4/4");
  const [durationSeconds, setDurationSeconds] = useState(song?.duration_seconds?.toString() || "");
  const [price, setPrice] = useState(song?.price?.toString() || "");
  const [lyricsText, setLyricsText] = useState(song?.lyrics_text || "");
  const [isPublished, setIsPublished] = useState(song?.is_published || false);
  const [tagIds, setTagIds] = useState<string[]>(selectedTagIds);

  // タイトルからslug自動生成
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!isEdit && !slug) {
      // 英語タイトルがあればそちらからslug生成
    }
  };

  const handleTitleEnChange = (value: string) => {
    setTitleEn(value);
    if (!isEdit || !slug) {
      setSlug(generateSlug(value));
    }
  };

  const toggleTag = (tagId: string) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      title,
      title_en: titleEn || null,
      slug,
      artist_id: artistId || null,
      album_id: albumId || null,
      description: description || null,
      bpm: bpm ? parseInt(bpm) : null,
      song_key: songKey || null,
      time_signature: timeSignature || "4/4",
      duration_seconds: durationSeconds ? parseInt(durationSeconds) : null,
      price: parseInt(price),
      lyrics_text: lyricsText || null,
      is_published: isPublished,
      tag_ids: tagIds,
    };

    try {
      const url = isEdit ? `/api/admin/songs/${song.id}` : "/api/admin/songs";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "保存に失敗しました");
      }

      router.push("/admin/songs");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 基本情報 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">基本情報</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="主の栄光が輝く"
              required
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">英語タイトル</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              placeholder="The Glory of the Lord Shines"
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
            placeholder="glory-of-the-lord"
            required
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            URL: /songs/{slug || "..."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">アーティスト</label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">アルバム</label>
            <select
              value={albumId}
              onChange={(e) => setAlbumId(e.target.value)}
              className={inputClass}
            >
              <option value="">選択してください</option>
              {albums.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">概要</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="楽曲の説明..."
            className={inputClass}
          />
        </div>
      </div>

      {/* 楽曲情報 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">楽曲情報</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">BPM</label>
            <input
              type="number"
              value={bpm}
              onChange={(e) => setBpm(e.target.value)}
              placeholder="120"
              min={1}
              max={300}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">キー</label>
            <select
              value={songKey}
              onChange={(e) => setSongKey(e.target.value)}
              className={inputClass}
            >
              <option value="">-</option>
              {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
                "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm"
              ].map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">拍子</label>
            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              className={inputClass}
            >
              <option value="4/4">4/4</option>
              <option value="3/4">3/4</option>
              <option value="6/8">6/8</option>
              <option value="2/4">2/4</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">秒数</label>
            <input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="240"
              min={1}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* 価格 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">価格設定</h2>
        <div className="space-y-2 max-w-xs">
          <label className="text-sm font-medium">価格（円）*</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1500"
            required
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      {/* タグ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">タグ</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? "bg-violet-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 歌詞 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">歌詞</h2>
        <textarea
          value={lyricsText}
          onChange={(e) => setLyricsText(e.target.value)}
          rows={8}
          placeholder="歌詞テキストを入力..."
          className={inputClass}
        />
      </div>

      {/* 公開設定 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPublished(!isPublished)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isPublished ? "bg-violet-600" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              isPublished ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm font-medium">
          {isPublished ? "公開中" : "下書き"}
        </span>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "保存中..." : isEdit ? "更新する" : "作成する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/songs")}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
