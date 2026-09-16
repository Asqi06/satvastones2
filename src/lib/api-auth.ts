import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export type SessionUser = {
  id?: string;
  email?: string | null;
  name?: string | null;
  role?: string;
};

/**
 * Returns the signed-in user, or null when there is no session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  return (session?.user as SessionUser | undefined) ?? null;
}

/**
 * Guard for admin-only API routes.
 *
 * Returns a NextResponse when the request must be rejected, otherwise null.
 * Usage:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return null;
}

/**
 * Guard for routes that only require a signed-in user (any role).
 */
export async function requireUser(): Promise<NextResponse | null> {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  return null;
}
