import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SECRET =
  process.env.AUTH_SECRET || "wallbox-dev-secret-change-me-please-0123456789";

export const SESSION_COOKIE = "wb_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function b64url(input: Buffer | string): string {
  const b = typeof input === "string" ? Buffer.from(input) : input;
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(base64, "base64");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const derived = scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(derived, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function signSession(userId: string): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + MAX_AGE })
  );
  const sig = b64url(createHmac("sha256", SECRET).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${sig}`;
}

export function verifySession(token: string): string | null {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const expected = b64url(createHmac("sha256", SECRET).update(`${h}.${p}`).digest());
    const a = Buffer.from(s);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(b64urlDecode(p).toString("utf8")) as {
      sub: string;
      exp: number;
    };
    if (!payload.sub || !payload.exp) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function getSessionUserId(req: NextRequest): string | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getSessionUser(req: NextRequest) {
  const id = getSessionUserId(req);
  if (!id) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code.toLowerCase();
}

export function publicUser(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    referralCode: u.referralCode,
    referredById: u.referredById,
    balance: u.balance,
    investedCapital: u.investedCapital,
    totalEarned: u.totalEarned,
    referralEarnings: u.referralEarnings,
    createdAt: u.createdAt,
  };
}
