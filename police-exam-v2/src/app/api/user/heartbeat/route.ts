import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST: record heartbeat for a user (call every 2-3 minutes from client)
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ ok: false }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ ok: false }, { status: 404 });

    await prisma.systemSetting.upsert({
      where: { key: `hb_${user.id}` },
      update: { value: new Date().toISOString() },
      create: { key: `hb_${user.id}`, value: new Date().toISOString() },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: count online users (heartbeat within last 5 minutes)
export async function GET() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const records = await prisma.systemSetting.findMany({
      where: { key: { startsWith: "hb_" } },
    });
    const online = records.filter((r) => r.value >= fiveMinutesAgo).length;
    return NextResponse.json({ online });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
