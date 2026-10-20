import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, plans, investments, transactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  try {
    const { investmentId } = (await req.json()) as { investmentId?: string };
    if (!investmentId) {
      return NextResponse.json({ error: "Investissement requis." }, { status: 400 });
    }
    const invRows = await db
      .select()
      .from(investments)
      .where(and(eq(investments.id, investmentId), eq(investments.userId, user.id)))
      .limit(1);
    if (invRows.length === 0) {
      return NextResponse.json({ error: "Investissement introuvable." }, { status: 404 });
    }
    const inv = invRows[0];
    if (inv.status !== "active") {
      return NextResponse.json({ error: "Cet investissement est déjà terminé." }, { status: 400 });
    }
    const planRows = await db.select().from(plans).where(eq(plans.id, inv.planId)).limit(1);
    const duration = planRows[0]?.durationDays ?? 30;

    const now = Date.now();
    const last = new Date(inv.lastClaimAt).getTime();
    const daysSince = Math.floor((now - last) / (24 * 3600 * 1000));
    const remaining = duration - inv.daysClaimed;
    const claimDays = Math.max(0, Math.min(daysSince, remaining));

    if (claimDays <= 0) {
      const nextIn = 24 - Math.floor((now - last) / (3600 * 1000)) % 24;
      return NextResponse.json(
        { error: `Aucun gain à réclamer pour le moment. Revenez dans ~${Math.max(nextIn, 1)} h.` },
        { status: 400 }
      );
    }

    const gain = claimDays * inv.dailyProfit;
    const newDaysClaimed = inv.daysClaimed + claimDays;
    const finished = newDaysClaimed >= duration;

    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${gain}${finished ? sql` + ${inv.amount}` : sql``}`,
        totalEarned: sql`${users.totalEarned} + ${gain}`,
        ...(finished ? { investedCapital: sql`${users.investedCapital} - ${inv.amount}` } : {}),
      })
      .where(eq(users.id, user.id));

    await db
      .update(investments)
      .set({
        daysClaimed: newDaysClaimed,
        totalClaimed: sql`${investments.totalClaimed} + ${gain}`,
        lastClaimAt: new Date(),
        status: finished ? "completed" : "active",
      })
      .where(eq(investments.id, inv.id));

    await db.insert(transactions).values({
      userId: user.id,
      type: "earning",
      amount: gain,
      status: "completed",
      label: `Gains réclamés : ${claimDays} jour(s) × ${inv.dailyProfit.toLocaleString("fr-FR")} FCFA`,
    });

    if (finished) {
      await db.insert(transactions).values({
        userId: user.id,
        type: "deposit",
        amount: inv.amount,
        status: "completed",
        label: `Capital restitué — investissement ${inv.amount.toLocaleString("fr-FR")} FCFA terminé`,
      });
    }

    return NextResponse.json({ ok: true, gain, claimDays, finished, capitalReturned: finished ? inv.amount : 0 });
  } catch (e) {
    console.error("claim", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
