import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, plans, investments, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";
import { REF_RATES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { planId, amount } = (await req.json()) as {
      planId?: number;
      amount?: number;
    };
    const amt = Math.floor(Number(amount));
    if (!planId || !amt || amt <= 0) {
      return NextResponse.json({ error: "Montant invalide." }, { status: 400 });
    }
    const planRows = await db.select().from(plans).where(eq(plans.id, Number(planId))).limit(1);
    if (planRows.length === 0) {
      return NextResponse.json({ error: "Plan introuvable." }, { status: 404 });
    }
    const plan = planRows[0];
    if (amt < plan.minAmount || amt > plan.maxAmount) {
      return NextResponse.json(
        { error: `Ce plan accepte entre ${plan.minAmount.toLocaleString("fr-FR")} et ${plan.maxAmount.toLocaleString("fr-FR")} FCFA.` },
        { status: 400 }
      );
    }
    if (user.balance < amt) {
      return NextResponse.json(
        { error: "Solde insuffisant. Effectuez un dépôt pour investir." },
        { status: 400 }
      );
    }

    const dailyProfit = Math.floor((amt * plan.dailyRate) / 100);
    const endDate = new Date(Date.now() + plan.durationDays * 24 * 3600 * 1000);

    await db
      .update(users)
      .set({
        balance: sql`${users.balance} - ${amt}`,
        investedCapital: sql`${users.investedCapital} + ${amt}`,
      })
      .where(eq(users.id, user.id));

    const inv = await db
      .insert(investments)
      .values({
        userId: user.id,
        planId: plan.id,
        amount: amt,
        dailyProfit,
        status: "active",
        endDate,
      })
      .returning();

    await db.insert(transactions).values({
      userId: user.id,
      type: "investment",
      amount: -amt,
      status: "completed",
      label: `Investissement ${plan.name} — ${amt.toLocaleString("fr-FR")} FCFA à ${plan.dailyRate}%/jour pendant ${plan.durationDays} j`,
    });

    // Commissions parrainage 3 niveaux : 10% / 5% / 2%
    let currentRef: string | null = user.referredById;
    for (let level = 0; level < 3 && currentRef; level++) {
      const refRows = await db.select().from(users).where(eq(users.id, currentRef)).limit(1);
      if (refRows.length === 0) break;
      const ref = refRows[0];
      const commission = Math.floor(amt * REF_RATES[level]);
      if (commission > 0) {
        await db
          .update(users)
          .set({
            balance: sql`${users.balance} + ${commission}`,
            referralEarnings: sql`${users.referralEarnings} + ${commission}`,
            totalEarned: sql`${users.totalEarned} + ${commission}`,
          })
          .where(eq(users.id, ref.id));
        await db.insert(transactions).values({
          userId: ref.id,
          type: "referral",
          amount: commission,
          status: "completed",
          label: `Commission niveau ${level + 1} (${REF_RATES[level] * 100}%) — filleul ${user.name} a investi ${amt.toLocaleString("fr-FR")} FCFA`,
        });
      }
      currentRef = ref.referredById;
    }

    return NextResponse.json({ ok: true, investment: inv[0], dailyProfit });
  } catch (e) {
    console.error("invest", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
