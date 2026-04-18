"use client";

import { useState } from "react";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isOffline = process.env.NEXT_PUBLIC_OFFLINE_BUNDLE === "1";
  if (isOffline) {
    return (
      <main className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-mute">Offline bundle — login disabled.</p>
      </main>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password, next: searchParams.next ?? "/" }),
    });
    if (res.ok) {
      const { next } = (await res.json()) as { next: string };
      window.location.href = next;
      return;
    }
    if (res.status === 429) setErr("太频繁了，稍等一分钟再试");
    else setErr("密码不对");
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
      <form onSubmit={submit} className="w-full space-y-4">
        <h1 className="font-serif text-h1">Purr·AI Dashboard</h1>
        <p className="text-mute">请输入密码</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          className="w-full rounded-md border border-mute-soft bg-cream px-4 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-clay px-4 py-2 text-cream disabled:opacity-50"
        >
          {loading ? "正在验证..." : "登录"}
        </button>
        {err ? <p className="text-clay">{err}</p> : null}
      </form>
    </main>
  );
}
