import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE_SEC = 60 * 60 * 12;

function secret(): Uint8Array | null {
  const s = process.env.SESSION_SECRET;
  return s && s.length >= 32 ? new TextEncoder().encode(s) : null;
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !secret()) return false;
  const h = (v: string) => createHash("sha256").update(v).digest();
  return timingSafeEqual(h(input), h(expected));
}

export async function createSession(): Promise<string> {
  const key = secret();
  if (!key) throw new Error("SESSION_SECRET must be set (32+ chars)");
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(key);
}

export async function verifySession(token: string | undefined): Promise<boolean> {
  const key = secret();
  if (!token || !key) return false;
  try {
    await jwtVerify(token, key, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SEC,
};
