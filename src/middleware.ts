import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth-server";

const ADMIN_PREFIXES = ["/admin", "/api/admin"];

const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 100;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit auth mutations
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/admin/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    if (rateLimited(`${ip}:${pathname}`)) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }
  }

  // Admin area — JWT cookie check
  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    if (pathname === "/admin/signin" || pathname === "/api/admin/signin") {
      return NextResponse.next();
    }
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const admin = cookie ? await verifyAdminToken(cookie) : null;
    if (!admin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const url = request.nextUrl.clone();
      url.pathname = "/admin/signin";
      return NextResponse.redirect(url);
    }
  }

  // All other auth (user sessions) is handled by the backend via httpOnly cookies.
  // No Next.js session check — pages do their own client-side redirect.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js).*)"],
};
