import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { publicUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user: publicUser(user) });
}
