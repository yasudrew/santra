import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      </div>

      {/* Purchase History Placeholder */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">購入履歴</h2>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground text-sm">
            まだ購入履歴がありません
          </p>
          <a
            href="/songs"
            className="inline-block mt-4 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            楽曲を探す
          </a>
        </div>
      </div>
    </div>
  );
}
