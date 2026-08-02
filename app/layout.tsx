import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "援農パスポート",
  description: "援農ボランティア参加管理LINEアプリの第1段階UI試作品",
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
