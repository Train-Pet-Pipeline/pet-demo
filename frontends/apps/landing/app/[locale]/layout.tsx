import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "@purrai/theme/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Purr·AI",
  description: "听懂每一声咕噜、低吟、呼吸。",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: { children: React.ReactNode; params: { locale: string } }) {
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
