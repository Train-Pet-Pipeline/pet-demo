import { getRequestConfig } from "next-intl/server";

export const locales = ["zh", "en"] as const;
export const defaultLocale = "zh";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }
  return { locale, messages: (await import(`./messages/${locale}.json`)).default };
});
