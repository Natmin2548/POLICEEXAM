import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true, role: true },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const [totalUsers, totalQuestions, totalAttempts, reportedCount, recentReports, supportTicketCount, recentTickets] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.quizAttempt.count(),
      prisma.reportedQuestion.count(),
      prisma.reportedQuestion.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, fullName: true } } },
      }),
      prisma.supportTicket.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, fullName: true } } },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalAttempts,
      reportedCount,
      recentReports,
      supportTicketCount,
      recentTickets,
    });
  } catch (error: any) {
    console.error("Error in admin overview:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
