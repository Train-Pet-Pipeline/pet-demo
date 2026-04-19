import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/JsonLd";

describe("JsonLd", () => {
  it("emits a script tag with SoftwareApplication schema", () => {
    const { container } = render(
      <JsonLd
        name="Purr·AI"
        description="desc"
        url="https://purrai.example/en"
      />,
    );
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent!);
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("SoftwareApplication");
    expect(data.name).toBe("Purr·AI");
    expect(data.url).toBe("https://purrai.example/en");
    expect(data.applicationCategory).toBe("HealthApplication");
    expect(data.offers.price).toBe("0");
  });
});
