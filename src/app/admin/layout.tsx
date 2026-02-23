import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: {
    default: "管理画面",
    template: "%s | 管理画面 | サントラ",
  },
};

const navItems = [
  { href: "/admin", icon: "📊", label: "ダッシュボード" },
  { href: "/admin/songs", icon: "🎵", label: "楽曲管理" },
  { href: "/admin/artists", icon: "🎤", label: "アーティスト" },
  { href: "/admin/orders", icon: "📦", label: "注文管理" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 管理者チェック
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border bg-card flex-shrink-0 hidden md:block">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <hr className="my-3 border-border" />
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <span>←</span>
            サイトに戻る
          </Link>
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
