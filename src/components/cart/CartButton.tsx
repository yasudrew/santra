"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartButton() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      <span className="text-sm">🛒</span>
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-600 text-[10px] font-bold text-white flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
