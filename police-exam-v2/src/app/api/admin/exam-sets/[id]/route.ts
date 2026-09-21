import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function verifyAdmin(email: string | null) {
  if (!email) return false;
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET /api/admin/exam-sets/[id]?email=...  → get questions in ExamSet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = req.nextUrl.searchParams.get("email");
  if (!(await verifyAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const examSetId = parseInt(id);
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const [examSet, questions, total] = await Promise.all([
    prisma.examSet.findUnique({
      where: { id: examSetId },
      select: { id: true, title: true, category: true, totalCount: true },
    }),
    prisma.question.findMany({
      where: { examSetId },
      orderBy: { sortOrder: "asc" },
      skip,
      take: limit,
      select: {
        id: true,
        questionText: true,
        choice1: true,
        choice2: true,
        choice3: true,
        choice4: true,
        correctAnswer: true,
        explanation: true,
        sortOrder: true,
        difficulty: true,
        topic: true,
      },
    }),
    prisma.question.count({ where: { examSetId } }),
  ]);

  if (!examSet) {
    return NextResponse.json({ error: "ExamSet not found" }, { status: 404 });
  }

  return NextResponse.json({ examSet, questions, total, page, limit });
}
