"use client";
import { useState, useId, type FormEvent } from "react";
import { z } from "zod";

const Email = z.string().email();

export interface EmailFormProps {
  endpoint?: string;
  labelText?: string;
  buttonText?: string;
  successText?: string;
  busyText?: string;
  errorText?: string;
}

type State = "idle" | "submitting" | "ok" | "busy" | "error";

export function EmailForm({
  endpoint = "/api/subscribe",
  labelText = "邮箱",
  buttonText = "订阅",
  successText = "我们会在上线时通知你",
  busyText = "订阅通道繁忙,稍后再试",
  errorText = "提交失败,请稍后重试",
}: EmailFormProps) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>("idle");
  const [invalid, setInvalid] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = Email.safeParse(value);
    if (!parsed.success) { setInvalid(true); return; }
    setInvalid(false);
    setState("submitting");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (r.status === 200) setState("ok");
      else if (r.status === 429) setState("busy");
      else setState("error");
    } catch { setState("error"); }
  }

  if (state === "ok") return <p role="status">{successText}</p>;

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor={inputId} className="sr-only">{labelText}</label>
      <div className="flex gap-2 items-center">
        <input
          id={inputId}
          type="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? errorId : undefined}
          disabled={state === "submitting"}
          placeholder={labelText}
          className="border border-ink/30 bg-cream/80 px-4 py-2 rounded-md text-sm text-ink placeholder:text-mute flex-1 focus:ring-2 focus:ring-clay focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="bg-clay text-cream px-5 py-2 rounded-md text-sm font-medium hover:bg-clay/90 transition focus-visible:ring-2 focus-visible:ring-clay focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {buttonText}
        </button>
      </div>
      {invalid && <span id={errorId} role="alert" className="mt-1 block text-xs text-clay">请输入有效邮箱</span>}
      {state === "busy" && <span role="alert" className="mt-1 block text-xs text-mute">{busyText}</span>}
      {state === "error" && <span role="alert" className="mt-1 block text-xs text-clay">{errorText}</span>}
    </form>
  );
}
