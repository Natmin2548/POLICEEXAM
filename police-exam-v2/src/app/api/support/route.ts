import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, type, message } = await req.json();

    if (!email || !message?.trim()) {
      return NextResponse.json({ error: "กรุณากรอกข้อความ" }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        message: `[${type || "ทั่วไป"}] ${message.trim()}`,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (err: any) {
    console.error("Support ticket error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 });
  }
}
