import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailForm } from "../src/EmailForm";

const ok = () => Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
const err = (status: number) => Promise.resolve(new Response("", { status }));

describe("EmailForm", () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it("rejects invalid email with aria-invalid", async () => {
    const user = userEvent.setup();
    render(<EmailForm />);
    await user.type(screen.getByLabelText(/邮箱/), "not-an-email");
    await user.click(screen.getByRole("button", { name: /订阅/ }));
    expect(screen.getByLabelText(/邮箱/)).toHaveAttribute("aria-invalid", "true");
  });

  it("on valid email + 200 shows success state", async () => {
    vi.spyOn(global, "fetch").mockImplementation(ok);
    const user = userEvent.setup();
    render(<EmailForm />);
    await user.type(screen.getByLabelText(/邮箱/), "person@example.com");
    await user.click(screen.getByRole("button", { name: /订阅/ }));
    expect(await screen.findByText(/我们会在上线时通知你/)).toBeInTheDocument();
  });

  it("on 429 shows busy error", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => err(429));
    const user = userEvent.setup();
    render(<EmailForm />);
    await user.type(screen.getByLabelText(/邮箱/), "person@example.com");
    await user.click(screen.getByRole("button", { name: /订阅/ }));
    expect(await screen.findByText(/订阅通道繁忙/)).toBeInTheDocument();
  });
});
