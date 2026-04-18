import { useTranslations } from "next-intl";

export default function HomePage() {
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
