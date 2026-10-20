import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  hashPassword,
  signSession,
  sessionCookieOptions,
  SESSION_COOKIE,
  generateReferralCode,
  publicUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, refCode } = body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      refCode?: string;
    };

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 6 caractères." },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, cleanEmail), eq(users.phone, phone.trim())))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet e-mail ou ce numéro." },
        { status: 409 }
      );
    }

    let referredById: string | null = null;
    let referrerName: string | null = null;
    if (refCode && String(refCode).trim() !== "") {
      const code = String(refCode).trim().toLowerCase();
      const ref = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, code))
        .limit(1);
      if (ref.length > 0) {
        referredById = ref[0].id;
        referrerName = ref[0].name;
      }
    }

    let referralCode = generateReferralCode();
    for (let i = 0; i < 5; i++) {
      const check = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);
      if (check.length === 0) break;
      referralCode = generateReferralCode();
    }

    const inserted = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: cleanEmail,
        phone: phone.trim(),
        passwordHash: hashPassword(password),
        referralCode,
        referredById,
        balance: 0,
      })
      .returning();

    const user = inserted[0];

    // Bonus de bienvenue : 1 000 FCFA offerts
    const WELCOME = 1000;
    await db
      .update(users)
      .set({ balance: WELCOME })
      .where(eq(users.id, user.id));
    await db.insert(transactions).values({
      userId: user.id,
      type: "bonus",
      amount: WELCOME,
      status: "completed",
      label: "Bonus de bienvenue offert",
    });

    const token = signSession(user.id);
    const res = NextResponse.json({
      user: { ...publicUser(user), balance: WELCOME },
      referrerName,
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json(
      { error: "Erreur serveur, réessayez dans un instant." },
      { status: 500 }
    );
  }
}
