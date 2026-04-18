import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionShell } from "../src/SectionShell";

describe("SectionShell", () => {
  it("renders as <section> with id and aria-labelledby", () => {
    render(
      <SectionShell id="section-01-hero" headingId="section-01-heading">
        <h2 id="section-01-heading">Hero</h2>
      </SectionShell>
    );
    const section = screen.getByRole("region", { name: "Hero" });
    expect(section.tagName).toBe("SECTION");
    expect(section).toHaveAttribute("id", "section-01-hero");
    expect(section).toHaveAttribute("aria-labelledby", "section-01-heading");
  });
});
