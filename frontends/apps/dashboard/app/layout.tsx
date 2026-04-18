import type { Metadata } from "next";
import "@purrai/theme/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Purr·AI Dashboard",
  description: "On-device pet vision pipeline · investor demo",
  openGraph: {
    title: "Purr·AI Dashboard",
    description: "On-device pet vision pipeline",
    images: ["/og-cover.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
