import { render, screen } from "@testing-library/react";
import { UnscriptedBanner } from "@/components/UnscriptedBanner";

it("renders the banner text", () => {
  render(<UnscriptedBanner />);
  expect(screen.getByText(/真实拍摄片段/)).toBeInTheDocument();
});
