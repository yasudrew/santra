import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // 決済完了イベントを処理
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("Error processing checkout:", error);
      return NextResponse.json(
        { error: "Error processing checkout" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = createAdminClient();

  const userId = session.metadata?.user_id;
  const songIdsRaw = session.metadata?.song_ids;

  if (!userId || !songIdsRaw) {
    throw new Error("Missing metadata: user_id or song_ids");
  }

  const songIds: string[] = JSON.parse(songIdsRaw);

  // 1. 楽曲の価格情報を取得
  const { data: songs, error: songsError } = await supabase
    .from("songs")
    .select("id, price")
    .in("id", songIds);

  if (songsError || !songs) {
    throw new Error("Failed to fetch songs");
  }

  const totalAmount = songs.reduce((sum, song) => sum + song.price, 0);

  // 2. 注文レコードを作成
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      status: "completed",
      total_amount: totalAmount,
    })
    .select()
    .single();

  if (orderError || !order) {
    throw new Error(`Failed to create order: ${orderError?.message}`);
  }

  // 3. 注文明細を作成
  const orderItems = songs.map((song) => ({
    order_id: order.id,
    song_id: song.id,
    price_at_purchase: song.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // 4. ダウンロード権限を付与
  const downloads = songs.map((song) => ({
    user_id: userId,
    song_id: song.id,
    order_id: order.id,
    download_count: 0,
    max_downloads: 5,
  }));

  const { error: downloadsError } = await supabase
    .from("downloads")
    .upsert(downloads, { onConflict: "user_id,song_id" });

  if (downloadsError) {
    throw new Error(`Failed to create downloads: ${downloadsError.message}`);
  }

  console.log(`✅ Order ${order.id} completed for user ${userId} — ${songs.length} songs`);
}
