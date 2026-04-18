// app/layout.tsx
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh"><body className="bg-cream text-ink">{children}</body></html>;
}
