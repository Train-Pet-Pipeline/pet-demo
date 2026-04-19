import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["zh", "en"] as const;
export const defaultLocale = "zh";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as (typeof locales)[number])) notFound();
  return { messages: (await import(`./messages/${locale}.json`)).default };
});
