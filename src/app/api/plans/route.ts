import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc } from "drizzle-orm";
import { SEED_PLANS } from "@/lib/utils";

export async function GET() {
  let list = await db.select().from(plans).orderBy(asc(plans.sort));
  if (list.length === 0) {
    await db.insert(plans).values(
      SEED_PLANS.map((p) => ({ ...p, active: true }))
    );
    list = await db.select().from(plans).orderBy(asc(plans.sort));
  }
  return NextResponse.json({ plans: list });
}
