import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      examSetId,
      title,
      category,
      score,
      totalScore,
      timeSpent,
      answersJson,
    } = body;

    const uId = Number(userId) || 1;
    const finalScore = Number(score) || 0;
    const finalTotal = Number(totalScore) || 150;
    const passed = finalTotal > 0 && finalScore / finalTotal >= 0.6;

    const scorePct = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0;

    // Create attempt record matching Supabase schema
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: uId,
        subject: category || "PRETEST",
        setId: examSetId ? String(examSetId) : null,
        setTitle: title || "ข้อสอบเสมือนจริง",
        scorePct,
        correctCount: finalScore,
        totalQuestions: finalTotal,
      },
    });

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error: any) {
    console.error("API /api/exams/submit error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save exam attempt" },
      { status: 500 }
    );
  }
}
