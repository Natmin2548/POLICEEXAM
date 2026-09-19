import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where = category ? { category: { contains: category } } : {};

    const examSets = await prisma.examSet.findMany({
      where,
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });

    const totalQuestions = await prisma.question.count();

    return NextResponse.json({
      success: true,
      data: examSets,
      totalExamSets: examSets.length,
      totalQuestions,
    });
  } catch (error: any) {
    console.error("API /api/exams error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch exam sets" },
      { status: 500 }
    );
  }
}
