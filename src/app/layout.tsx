import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/layout/Header";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "サントラ | 日本の教会のための賛美トラック",
    template: "%s | サントラ",
  },
  description:
    "ハイクオリティなステムデータで、あなたの教会でも豊かな賛美を。ドラム、ベース、キーボード等のパート別音源をダウンロード。",
  keywords: ["賛美", "ワーシップ", "トラック", "ステム", "教会", "礼拝"],
  openGraph: {
    title: "サントラ | 日本の教会のための賛美トラック",
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
        className={`${notoSansJP.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
