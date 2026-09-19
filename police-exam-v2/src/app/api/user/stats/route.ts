import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? parseInt(userIdParam, 10) : 1;

    // 1. Fetch user attempts
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const totalExams = attempts.length;

    // 2. Calculate average and max score
    let avgScore = 0;
    let maxScore = 0;
    if (totalExams > 0) {
      const pcts = attempts.map((curr) => curr.scorePct ?? 0);
      const totalPct = pcts.reduce((acc, curr) => acc + curr, 0);
      avgScore = Math.round(totalPct / totalExams);
      maxScore = Math.max(...pcts);
    }

    // 3. Readiness status
    let readiness = "ยังไม่มีข้อมูล";
    if (totalExams > 0) {
      if (avgScore >= 75) readiness = "พร้อมสอบสูง";
      else if (avgScore >= 50) readiness = "ปานกลาง";
      else readiness = "ต้องเตรียมตัวเพิ่ม";
    }

    // 4. Calculate Subject Breakdown
    const subjectDefinitions = [
      {
        id: "th",
        name: "ภาษาไทย",
        keyWord: "ไทย",
        icon: "TH",
        color: "rose",
      },
      {
        id: "general",
        name: "ความสามารถทั่วไป",
        keyWord: "ทั่วไป",
        icon: "🧠",
        color: "pink",
      },
      {
        id: "computer",
        name: "คอมพิวเตอร์",
        keyWord: "คอม",
        icon: "💻",
        color: "sky",
      },
      {
        id: "law",
        name: "กฎหมาย",
        keyWord: "กฎหมาย",
        icon: "⚖️",
        color: "amber",
      },
      {
        id: "social",
        name: "สังคม",
        keyWord: "สังคม",
        icon: "🌍",
        color: "emerald",
      },
      {
        id: "en",
        name: "ภาษาอังกฤษ",
        keyWord: "อังกฤษ",
        icon: "EN",
        color: "amber",
      },
    ];

    const subjects = subjectDefinitions.map((sub) => {
      // Find matching attempts
      const matched = attempts.filter(
        (a) =>
          (a.subject && a.subject.includes(sub.keyWord)) ||
          (a.setTitle && a.setTitle.includes(sub.keyWord))
      );

      const count = matched.length;
      let pct = 0;
      if (count > 0) {
        const sumPct = matched.reduce((acc, curr) => acc + (curr.scorePct ?? 0), 0);
        pct = Math.round(sumPct / count);
      }

      return {
        id: sub.id,
        name: sub.name,
        times: `${count} ครั้ง`,
        pct,
        icon: sub.icon,
        color: sub.color,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalExams,
        avgScore,
        maxScore,
        readiness,
        subjects,
        recentAttempts: attempts.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("API /api/user/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}
