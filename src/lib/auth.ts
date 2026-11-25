import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Access control.
 *
 * By default the dashboard is OPEN: no login, anyone with the link can view it
 * and manage dashboards at /admin.
 *
 * To lock it, set ACCESS_PASSWORD in your environment. One password then
 * protects every page (dashboards and /admin).
 */

const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "";
export const PASSWORD_REQUIRED = ACCESS_PASSWORD.length > 0;

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || `pipeline-dashboard:${ACCESS_PASSWORD}`
);
const SESSION_COOKIE = "pd-session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days

async function hasValidCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "viewer";
  } catch {
    return false;
  }
}

/** True when the visitor may see dashboards and manage them. */
export async function hasAccess(): Promise<boolean> {
  if (!PASSWORD_REQUIRED) return true;
  return hasValidCookie();
}

/** Kept for the existing routes: any visitor with access can view any dashboard. */
export async function getSession(): Promise<{ clientId: string } | null> {
  return (await hasAccess()) ? { clientId: "*" } : null;
}

export async function getAdminSession(): Promise<boolean> {
  return hasAccess();
}

export async function verifyAccessPassword(password: string): Promise<boolean> {
  if (!PASSWORD_REQUIRED) return true;
  return password === ACCESS_PASSWORD;
}

export async function createSession(): Promise<void> {
  const token = await new SignJWT({ role: "viewer" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
