import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // ユーザー認証確認
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "カートが空です" },
        { status: 400 }
      );
    }

    // 楽曲の価格をDBから取得（改ざん防止）
    const songIds = items.map((item: any) => item.song_id);
    const { data: songs, error: dbError } = await supabase
      .from("songs")
      .select("id, title, price")
      .in("id", songIds)
      .eq("is_published", true);

    if (dbError || !songs || songs.length === 0) {
      return NextResponse.json(
        { error: "楽曲が見つかりません" },
        { status: 400 }
      );
    }

    // Stripe Checkout Session の line_items を作成
    const lineItems = songs.map((song) => ({
      price_data: {
        currency: "jpy",
        product_data: {
          name: song.title,
        },
        unit_amount: song.price, // 日本円はそのまま（小数点なし）
      },
      quantity: 1,
    }));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Stripe Checkout Session 作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        song_ids: JSON.stringify(songs.map((s) => s.id)),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
