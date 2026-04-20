import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { locales } from "../../i18n";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { JsonLd } from "../../components/JsonLd";
import "@purrai/theme/fonts";
import "../globals.css";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[purrai] NEXT_PUBLIC_SITE_URL is not set. Canonical URLs will fall back to http://localhost:3100. " +
    "Set this variable in Vercel project settings for the landing app.",
  );
}
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(
  { params: { locale } }: { params: { locale: string } },
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "zh" ? "/" : `/${locale}`;
  const ogImage = t("ogImage");
  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        "zh-CN": "/",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}${path}`,
      siteName: "Purr·AI",
      images: [{ url: ogImage, width: 1200, height: 630 }],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [ogImage],
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: { children: React.ReactNode; params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "meta" });
  const path = locale === "zh" ? "/" : `/${locale}`;
  return (
    <html lang={locale}>
      <body>
        <JsonLd
          name="Purr·AI"
          description={t("description")}
          url={`${SITE_URL}${path}`}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LanguageSwitcher />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
