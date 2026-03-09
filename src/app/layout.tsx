import type { Metadata } from "next";
import { Noto_Sans_JP, Inter, M_PLUS_1p } from "next/font/google";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const mplus1p = M_PLUS_1p({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-mplus1p",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "賛美Tracks.com | 日本の教会のための賛美トラック",
    template: "%s | 賛美Tracks.com",
  },
  description:
    "ハイクオリティなステムデータで、あなたの教会でも豊かな賛美を。ドラム、ベース、キーボード等のパート別音源をダウンロード。",
  keywords: ["賛美", "ワーシップ", "トラック", "ステム", "教会", "礼拝"],
  openGraph: {
    title: "賛美Tracks.com | 日本の教会のための賛美トラック",
    description:
      "ハイクオリティなステムデータで、あなたの教会でも豊かな賛美を。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={`${notoSansJP.variable} ${inter.variable} ${mplus1p.variable} font-sans antialiased bg-background text-foreground`}
      >
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
