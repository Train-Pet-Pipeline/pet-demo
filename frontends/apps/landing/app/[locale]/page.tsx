import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("comingSoon");
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 64, margin: 0 }}>
          {t("wordmark")}
        </h1>
        <p style={{ marginTop: 16, fontSize: 18, color: "var(--color-ink-muted)" }}>{t("tagline")}</p>
        <p style={{ marginTop: 32, fontSize: 14, color: "var(--color-ink-muted)" }}>{t("subtitle")}</p>
      </div>
    </main>
  );
}
