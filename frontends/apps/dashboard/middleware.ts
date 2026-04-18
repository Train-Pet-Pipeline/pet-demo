import { NextRequest, NextResponse } from "next/server";
import { verifySession, requireAuthSecret, isAuthDisabled } from "@/lib/auth";
import { COOKIE_NAME } from "@/config";

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|og-cover).*)"],
};

export default async function middleware(req: NextRequest) {
  if (isAuthDisabled()) return NextResponse.next();
  if (req.nextUrl.pathname === "/login") return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const secret = requireAuthSecret();
  const result = await verifySession(cookie, secret);
  if (result.valid) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url, 307);
}
