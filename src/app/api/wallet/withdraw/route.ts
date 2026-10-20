import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { findOperator, validatePhoneForCountry, type PaymentCountryCode } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { amount, method, account, countryCode } = (await req.json()) as {
      amount?: number;
      method?: string;
      account?: string;
      countryCode?: PaymentCountryCode;
    };
    const amt = Math.floor(Number(amount));
    if (!amt || amt < 3000) {
      return NextResponse.json({ error: "Retrait minimum : 3 000 FCFA." }, { status: 400 });
    }
    const cleanAccount = String(account || "").trim();
    if (cleanAccount.length < 6) {
      return NextResponse.json({ error: "Numéro de retrait invalide." }, { status: 400 });
    }
    const op = findOperator(String(method || ""));
    const opCountry = (countryCode || op?.countryCode || "CI") as PaymentCountryCode;
    // validation souple du numéro selon le pays
    if (op && ["TG", "BJ", "CI", "SN"].includes(opCountry)) {
      if (!validatePhoneForCountry(cleanAccount, opCountry)) {
        const attendu = opCountry === "CI" ? "10 chiffres" : opCountry === "SN" ? "9 chiffres" : "8 chiffres";
        return NextResponse.json(
          { error: `Numéro invalide pour ${op.country} : ${attendu} attendus (ex : ${op.placeholder}).` },
          { status: 400 }
        );
      }
    }
    if (user.balance < amt) {
      return NextResponse.json({ error: "Solde insuffisant pour ce retrait." }, { status: 400 });
    }
    const fee = Math.round(amt * 0.03);
    const net = amt - fee;
    const methodName = op ? op.name : String(method || "Wave Côte d'Ivoire");

    await db
      .update(users)
      .set({ balance: sql`${users.balance} - ${amt}` })
      .where(eq(users.id, user.id));
    await db.insert(transactions).values({
      userId: user.id,
      type: "withdrawal",
      amount: -amt,
      status: "completed",
      method: methodName,
      label: `Retrait ${net.toLocaleString("fr-FR")} FCFA via ${methodName} vers ${cleanAccount} (frais 3% inclus) — traité en ~15 min`,
    });

    const rows = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    return NextResponse.json({ ok: true, balance: rows[0].balance, net });
  } catch (e) {
    console.error("withdraw", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
