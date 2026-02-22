"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useCallback, Suspense } from "react";

const MUSIC_KEYS = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
  "Cm", "C#m", "Dm", "D#m", "Em", "Fm", "F#m", "Gm", "G#m", "Am", "A#m", "Bm",
];

type Tag = {
  id: string;
  name: string;
  slug: string;
};

function FilterContent({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`${pathname}?${createQueryString("q", searchInput)}`);
  };

  const handleTagClick = (slug: string) => {
    const current = searchParams.get("tag");
    const newValue = current === slug ? "" : slug;
    router.push(`${pathname}?${createQueryString("tag", newValue)}`);
  };

  const handleKeyChange = (key: string) => {
    router.push(`${pathname}?${createQueryString("key", key)}`);
  };

  const handleClearAll = () => {
    router.push(pathname);
    setSearchInput("");
  };

  const hasFilters = searchParams.get("q") || searchParams.get("tag") || searchParams.get("key");

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="楽曲名で検索..."
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          検索
        </button>
      </form>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = searchParams.get("tag") === tag.slug;
          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-violet-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              #{tag.name}
            </button>
          );
        })}

        {/* Key Filter */}
        <select
          value={searchParams.get("key") || ""}
          onChange={(e) => handleKeyChange(e.target.value)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">キー: すべて</option>
          {MUSIC_KEYS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={handleClearAll}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕ フィルターをクリア
        </button>
      )}
    </div>
  );
}

export default function SongFilter({ tags }: { tags: Tag[] }) {
  return (
    <Suspense
      fallback={
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
      }
    >
      <FilterContent tags={tags} />
    </Suspense>
  );
}
