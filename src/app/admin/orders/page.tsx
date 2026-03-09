import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "注文管理" };

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      profile:profiles(display_name, church_name),
      order_items(
        *,
        song:songs(title)
      )
    `)
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, { label: string; class: string }> = {
    completed: { label: "完了", class: "bg-emerald-500/10 text-emerald-400" },
    pending: { label: "処理中", class: "bg-amber-500/10 text-amber-400" },
    failed: { label: "失敗", class: "bg-destructive/10 text-destructive" },
    refunded: { label: "返金済", class: "bg-zinc-500/10 text-zinc-400" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">注文管理</h1>

      {!orders || orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">注文がありません</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const status = statusLabels[order.status] || statusLabels.pending;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 bg-muted/30 border-b border-border gap-2">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {new Date(order.created_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className={`rounded px-2 py-0.5 font-medium ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                {/* User Info */}
                <div className="px-5 py-3 border-b border-border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 flex items-center justify-center text-xs text-white font-medium">
                    {order.profile?.display_name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {order.profile?.display_name || "不明なユーザー"}
                    </p>
                    {order.profile?.church_name && (
                      <p className="text-xs text-muted-foreground">
                        {order.profile.church_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-border">
                  {order.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎵</span>
                        <span className="text-sm">
                          {item.song?.title || "不明な楽曲"}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(item.price_at_purchase)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order ID */}
                <div className="px-5 py-2 bg-muted/30 border-t border-border">
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ID: {order.id}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
