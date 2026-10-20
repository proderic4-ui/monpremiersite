import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, plans, investments, transactions } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { getSessionUser, publicUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const myInvestments = await db
    .select()
    .from(investments)
    .where(eq(investments.userId, user.id))
    .orderBy(desc(investments.startDate))
    .limit(20);

  const planList = await db.select().from(plans);
  const planMap = new Map(planList.map((p) => [p.id, p]));

  const myTx = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    .orderBy(desc(transactions.createdAt))
    .limit(15);

  const teamL1 = await db
    .select({ c: count() })
    .from(users)
    .where(eq(users.referredById, user.id));
  const l1Ids = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referredById, user.id));

  let teamL2 = 0;
  let teamL3 = 0;
  if (l1Ids.length > 0) {
    const ids = l1Ids.map((r) => r.id);
    const l2rows = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.referredById} IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})`);
    teamL2 = l2rows.length;
    if (l2rows.length > 0) {
      const ids2 = l2rows.map((r) => r.id);
      const l3 = await db
        .select({ c: count() })
        .from(users)
        .where(sql`${users.referredById} IN (${sql.join(ids2.map((id) => sql`${id}`), sql`, `)})`);
      teamL3 = Number(l3[0]?.c ?? 0);
    }
  }

  const filleuls = await db
    .select({
      id: users.id,
      name: users.name,
      createdAt: users.createdAt,
      investedCapital: users.investedCapital,
    })
    .from(users)
    .where(eq(users.referredById, user.id))
    .orderBy(desc(users.createdAt))
    .limit(20);

  // gains réclamables estimés
  const now = Date.now();
  let claimable = 0;
  const enriched = myInvestments.map((inv) => {
    const plan = planMap.get(inv.planId);
    const last = new Date(inv.lastClaimAt).getTime();
    const daysSince = Math.floor((now - last) / (24 * 3600 * 1000));
    const remaining = (plan?.durationDays ?? 0) - inv.daysClaimed;
    const ready = inv.status === "active" ? Math.max(0, Math.min(daysSince, remaining)) : 0;
    claimable += ready * inv.dailyProfit;
    return {
      ...inv,
      plan: plan ?? null,
      readyDays: ready,
      readyAmount: ready * inv.dailyProfit,
      progress: plan ? Math.round((inv.daysClaimed / plan.durationDays) * 100) : 0,
    };
  });

  const activeInvested = myInvestments
    .filter((i) => i.status === "active")
    .reduce((s, i) => s + i.amount, 0);

  return NextResponse.json({
    user: publicUser(user),
    stats: {
      balance: user.balance,
      activeInvested,
      totalEarned: user.totalEarned,
      referralEarnings: user.referralEarnings,
      claimable,
      team: {
        l1: Number(teamL1[0]?.c ?? 0),
        l2: teamL2,
        l3: teamL3,
        total: Number(teamL1[0]?.c ?? 0) + teamL2 + teamL3,
      },
    },
    investments: enriched,
    transactions: myTx,
    filleuls,
  });
}
