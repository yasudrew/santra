import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-black text-muted-foreground/30">404</p>
        <h1 className="text-xl font-bold">ページが見つかりません</h1>
        <p className="text-sm text-muted-foreground">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-600 to-teal-500 px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          トップページへ
        </Link>
      </div>
    </div>
  );
}
