import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  verifyPassword,
  signSession,
  sessionCookieOptions,
  SESSION_COOKIE,
  publicUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail et mot de passe requis." },
        { status: 400 }
      );
    }
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.trim().toLowerCase()))
      .limit(1);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aucun compte trouvé avec cet e-mail." },
        { status: 404 }
      );
    }
    const user = rows[0];
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }
    const token = signSession(user.id);
    const res = NextResponse.json({ user: publicUser(user) });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
