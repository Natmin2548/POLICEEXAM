import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [userCount, examSetCount, questionCount, attemptCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.examSet.count(),
        prisma.question.count(),
        prisma.quizAttempt.count(),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        users: userCount,
        examSets: examSetCount,
        questions: questionCount,
        attempts: attemptCount,
      },
    });
  } catch (error: any) {
    console.error("API /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
