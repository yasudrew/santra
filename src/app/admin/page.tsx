import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 統計情報を取得
  const { count: songCount } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true });

  const { count: artistCount } = await supabase
    .from("artists")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 合計売上
  const { data: revenue } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "completed");

  const totalRevenue = revenue?.reduce((sum, o) => sum + o.total_amount, 0) || 0;

  // 最近の注文
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      profile:profiles(display_name)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "楽曲数", value: songCount || 0, icon: "🎵", href: "/admin/songs" },
    { label: "アーティスト", value: artistCount || 0, icon: "🎤", href: "/admin/artists" },
    { label: "注文数", value: orderCount || 0, icon: "📦", href: "/admin/orders" },
    { label: "ユーザー数", value: userCount || 0, icon: "👥", href: "#" },
    { label: "合計売上", value: formatPrice(totalRevenue), icon: "💰", href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ダッシュボード</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-card p-4 hover:border-violet-500/40 transition-colors"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近の注文</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-violet-500 hover:text-violet-400 transition-colors"
          >
            すべて見る →
          </Link>
        </div>

        {!recentOrders || recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">注文がありません</p>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">日時</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ユーザー</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">金額</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ja-JP")}
                    </td>
                    <td className="px-4 py-3">
                      {order.profile?.display_name || "不明"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-xs font-medium">
                        完了
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
