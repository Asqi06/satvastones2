import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Defense-in-depth guard.
 *
 * Individual route handlers still call requireAdmin() from "@/lib/api-auth";
 * this middleware is a second layer so a newly added admin route is not
 * publicly writable if someone forgets the in-handler guard.
 */

const PUBLIC_API_PREFIXES = [
  "/api/auth",
  "/api/checkout",
  "/api/newsletter",
  "/api/coupons/validate",
];

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const role = (token as { role?: string } | null)?.role;
  const isAdmin = role === "ADMIN";

  // Admin pages: redirect non-admins away instead of showing a broken shell.
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Mutating API calls must come from an admin, except explicitly public ones.
  if (pathname.startsWith("/api") && WRITE_METHODS.has(request.method)) {
    if (isPublicApi(pathname)) {
      return NextResponse.next();
    }

    // Signed-in users may manage their own addresses.
    if (pathname.startsWith("/api/addresses")) {
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
