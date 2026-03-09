"use client";

import { useCart, type CartItem } from "../cart/CartProvider";

type AddToCartButtonProps = {
  song: {
    id: string;
    slug: string;
    title: string;
    price: number;
    cover_image_url?: string;
    artist?: { name: string } | null;
  };
};

export default function AddToCartButton({ song }: AddToCartButtonProps) {
  const { addItem, isInCart, removeItem } = useCart();
  const inCart = isInCart(song.id);

  const handleClick = () => {
    if (inCart) {
      removeItem(song.id);
    } else {
      const item: CartItem = {
        id: song.id,
        slug: song.slug,
        title: song.title,
        artist_name: song.artist?.name || "",
        price: song.price,
        cover_image_url: song.cover_image_url,
      };
      addItem(item);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
        inCart
          ? "bg-muted text-foreground border border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          : "bg-gradient-to-r from-sky-600 to-teal-500 text-white hover:opacity-90"
      }`}
    >
      {inCart ? "カートから削除" : "カートに追加"}
    </button>
  );
}
