import { instrumentLabels } from "@/lib/utils";

// 楽器タイプごとのアイコン
const instrumentIcons: Record<string, string> = {
  drums: "🥁",
  bass: "🎸",
  keys: "🎹",
  guitar: "🎸",
  synth: "🎛️",
  strings: "🎻",
  vocals: "🎤",
  click: "🔊",
  guide: "📢",
};

// 楽器タイプごとのカラー
const instrumentColors: Record<string, string> = {
  drums: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  bass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  keys: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  guitar: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  synth: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  strings: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  vocals: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  click: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  guide: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

type Stem = {
  id: string;
  name: string;
  instrument_type: string;
  file_size_bytes?: number;
  sort_order: number;
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)}MB` : `${(bytes / 1024).toFixed(0)}KB`;
}

export default function StemList({ stems }: { stems: Stem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
      {stems.map((stem) => {
        const icon = instrumentIcons[stem.instrument_type] || "🎵";
        const colorClass =
          instrumentColors[stem.instrument_type] ||
          "bg-muted text-muted-foreground border-border";
        const label =
          instrumentLabels[stem.instrument_type] || stem.instrument_type;

        return (
          <div
            key={stem.id}
            className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg flex-shrink-0">
              {icon}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{stem.name}</p>
              <span
                className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium mt-1 ${colorClass}`}
              >
                {label}
              </span>
            </div>

            {/* File Size */}
            {stem.file_size_bytes && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatFileSize(stem.file_size_bytes)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
