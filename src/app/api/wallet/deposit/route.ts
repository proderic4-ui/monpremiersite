import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { ALL_METHOD_NAMES, findOperator } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { amount, method, countryCode } = (await req.json()) as {
      amount?: number;
      method?: string;
      countryCode?: string;
    };
    const amt = Math.floor(Number(amount));
    if (!amt || amt < 5000) {
      return NextResponse.json({ error: "Montant minimum de dépôt : 5 000 FCFA." }, { status: 400 });
    }
    if (amt > 10000000) {
      return NextResponse.json({ error: "Montant maximum : 10 000 000 FCFA." }, { status: 400 });
    }
    const raw = String(method || "wave-ci");
    const known = ALL_METHOD_NAMES.map((m) => m.toLowerCase()).includes(raw.toLowerCase());
    const op = findOperator(raw);
    const m = known ? raw : "Wave Côte d'Ivoire";
    const labelMethod = op ? `${op.name} ${op.country === "Togo" ? "🇹🇬" : op.country === "Bénin" ? "🇧🇯" : op.countryCode === "CI" ? "🇨🇮" : "🇸🇳"}` : m;

    await db
      .update(users)
      .set({ balance: sql`${users.balance} + ${amt}` })
      .where(eq(users.id, user.id));
    await db.insert(transactions).values({
      userId: user.id,
      type: "deposit",
      amount: amt,
      status: "completed",
      method: op ? op.name : m,
      label: `Dépôt via ${labelMethod}${countryCode ? ` (${countryCode})` : op ? ` (${op.country})` : ""} — crédité instantanément`,
    });

    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    return NextResponse.json({ ok: true, balance: rows[0].balance });
  } catch (e) {
    console.error("deposit", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
