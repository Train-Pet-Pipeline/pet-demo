import { NextRequest } from "next/server";
import { z } from "zod";

const Body = z.object({ email: z.string().email() });

export async function POST(req: NextRequest | Request) {
  let json: unknown;
  try { json = await req.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || null;
  const ua = req.headers.get("user-agent") ?? null;
  console.log(JSON.stringify({
    event: "subscribe_stub",
    email: parsed.data.email,
    ts: new Date().toISOString(),
    ua, ip,
  }));
  return Response.json({ ok: true }, { status: 200 });
}
