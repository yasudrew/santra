import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "マイページ",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 注文履歴を取得（注文明細 + 楽曲情報を結合）
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        *,
        song:songs(title, slug, artist:artists(name))
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  // ダウンロード可能な楽曲数を取得
  const { count: downloadCount } = await supabase
    .from("downloads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">マイページ</h1>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl text-white font-bold">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {profile?.display_name || "名前未設定"}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {profile?.church_name && (
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">教会名</p>
            <p className="text-sm font-medium">{profile.church_name}</p>
          </div>
        )}

        {/* Stats */}
        <div className="pt-4 border-t border-border flex gap-8">
          <div>
            <p className="text-2xl font-bold">{orders?.length || 0}</p>
            <p className="text-xs text-muted-foreground">注文数</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{downloadCount || 0}</p>
            <p className="text-xs text-muted-foreground">購入楽曲</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/downloads"
          className="rounded-xl border border-border bg-card p-5 hover:border-violet-500/40 transition-all group"
        >
          <div className="text-2xl mb-2">📥</div>
          <h3 className="font-semibold group-hover:text-violet-400 transition-colors">
            ダウンロード
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            購入した楽曲のステムデータをダウンロード
          </p>
        </Link>
        <Link
          href="/songs"
          className="rounded-xl border border-border bg-card p-5 hover:border-violet-500/40 transition-all group"
        >
          <div className="text-2xl mb-2">🎵</div>
          <h3 className="font-semibold group-hover:text-violet-400 transition-colors">
            楽曲を探す
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            新しい楽曲を見つけて購入する
          </p>
        </Link>
      </div>

      {/* Purchase History */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">購入履歴</h2>

        {!orders || orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">
              まだ購入履歴がありません
            </p>
            <Link
              href="/songs"
              className="inline-block mt-4 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              楽曲を探す
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {new Date(order.created_at).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 font-medium">
                      完了
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>

                {/* Order Items */}
                <div className="divide-y divide-border">
                  {order.order_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🎵</span>
                        <div>
                          <Link
                            href={`/songs/${item.song?.slug || ""}`}
                            className="text-sm font-medium hover:text-violet-400 transition-colors"
                          >
                            {item.song?.title || "不明な楽曲"}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {item.song?.artist?.name || ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatPrice(item.price_at_purchase)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
