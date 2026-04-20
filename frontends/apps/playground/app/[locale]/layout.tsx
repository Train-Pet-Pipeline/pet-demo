// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { locales } from "../../i18n";
import { Header } from "../../components/Header";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_PLAYGROUND_URL ?? "http://localhost:3200";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params: { locale } }: { params: { locale: string } },
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "zh" ? "/" : `/${locale}`;
  return {
    title: { default: t("title"), template: `%s | ${t("title")}` },
    description: t("description"),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: { "zh-CN": "/", en: "/en" },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}${path}`,
      siteName: "Purr·AI",
      locale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "a11y" });
  return (
    <html lang={locale}>
      <body className="bg-cream text-ink">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:text-cream focus:px-3 focus:py-2 focus:rounded">
          {t("skip")}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          <div id="main">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
