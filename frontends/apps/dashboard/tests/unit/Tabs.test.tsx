import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "@/components/Tabs";

const panels = {
  overview: { label: "概览", content: <div>overview content</div> },
  clips: { label: "片段", content: <div>clips content</div> },
  benchmarks: { label: "基准", content: <div>benchmarks content</div> },
};

describe("Tabs ARIA", () => {
  it("renders role=tablist", () => {
    render(<Tabs panels={panels} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });

  it("each button has role=tab", () => {
    render(<Tabs panels={panels} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  it("active tab has aria-selected=true, others false", () => {
    render(<Tabs panels={panels} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("tabpanel has correct role and is associated with tab", () => {
    render(<Tabs panels={panels} />);
    const panels_ = screen.getAllByRole("tabpanel");
    // Only visible (non-hidden) panels are returned; but tabpanels may be hidden
    // getAllByRole includes hidden by default in @testing-library — use queryAll
    // Actually getAllByRole excludes hidden elements. Use hidden:true option.
    const allPanels = screen.getAllByRole("tabpanel", { hidden: true });
    expect(allPanels).toHaveLength(3);
    expect(allPanels[0]).toHaveAttribute("aria-labelledby", "tab-overview");
    expect(allPanels[0]).not.toHaveAttribute("hidden");
    expect(allPanels[1]).toHaveAttribute("hidden");
  });

  it("arrow-right moves focus to next tab and activates it", async () => {
    const user = userEvent.setup();
    render(<Tabs panels={panels} />);
    const tabs = screen.getAllByRole("tab");
    const tab1 = tabs[0]!;
    tab1.focus();
    await user.keyboard("{ArrowRight}");
    const updatedTabs = screen.getAllByRole("tab");
    expect(updatedTabs[1]).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(updatedTabs[1]);
  });

  it("Space/Enter activates focused tab", async () => {
    const user = userEvent.setup();
    render(<Tabs panels={panels} />);
    const tabs = screen.getAllByRole("tab");
    const tab2 = tabs[1]!;
    tab2.focus();
    await user.keyboard(" ");
    expect(tab2).toHaveAttribute("aria-selected", "true");
  });
});
