// Server component — no "use client".

interface JsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function JsonLd({ name, description, url }: JsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    applicationCategory: "HealthApplication",
    operatingSystem: "Linux (RK3576 edge device)",
    description,
    url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
