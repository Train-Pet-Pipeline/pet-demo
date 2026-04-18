import { render, screen, fireEvent } from "@testing-library/react";
import { ChapterNav } from "@/components/ChapterNav";

const chapters = [
  { start: 0, end: 8, text: "Chapter 1", confidence: 0.8 },
  { start: 8, end: 16, text: "Chapter 2", confidence: 0.9 },
];

it("clicking chapter 2 button sets video currentTime", () => {
  let jumped = -1;
  render(<ChapterNav chapters={chapters} currentIdx={0} onJump={(t) => { jumped = t; }} />);
  const btn = screen.getByRole("button", { name: /章节 2/ });
  fireEvent.click(btn);
  expect(jumped).toBe(8);
});
