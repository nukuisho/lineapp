import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "援農パスポート",
  description: "援農ボランティアの参加記録アプリ(非公式)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
