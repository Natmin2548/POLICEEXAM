import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Find user in PostgreSQL with minimal required fields
    const dbUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        fullName: true,
        username: true,
        scoreThai: true,
        scoreGeneral: true,
        scoreComputer: true,
        scoreLaw: true,
        scoreSocial: true,
        scoreEnglish: true,
        role: true,
      },
    });

    if (!dbUser) {
      // User not in DB yet, return 0 stats with default initial recommendation
      return NextResponse.json({
        completedSets: 0,
        averageScore: 0,
        maxScore: 0,
        incorrectCount: 0,
        recommendation: {
          badge: "เริ่มต้นครั้งแรก",
          title: "ทดสอบวัดระดับครั้งแรก (Pretest 150 ข้อ)",
          description: "ลองทำข้อสอบเสมือนจริง 1 ชุด เพื่อให้ระบบช่วยวิเคราะห์ว่าคุณเก่งวิชาไหน และต้องเสริมวิชาไหน",
          buttonText: "เริ่มทำข้อสอบชุดแรก",
          actionUrl: "/exam/mock",
        },
        subjects: {
          thai: { count: 0, score: 0 },
          math: { count: 0, score: 0 },
          com: { count: 0, score: 0 },
          law: { count: 0, score: 0 },
          social: { count: 0, score: 0 },
          eng: { count: 0, score: 0 },
        },
      }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    // Fetch quiz attempts with selective projection using the new index
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: dbUser.id },
      select: {
        subject: true,
        setTitle: true,
        scorePct: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute subject counts and scores from attempts
    const subjectAttempts: Record<string, number[]> = {
      thai: [],
      math: [],
      com: [],
      law: [],
      social: [],
      eng: [],
    };

    attempts.forEach((a) => {
      const text = `${a.subject || ""} ${a.setTitle || ""}`.toLowerCase();
      const score = typeof a.scorePct === "number" ? a.scorePct : 0;
      if (text.includes("ไทย")) subjectAttempts.thai.push(score);
      else if (text.includes("ทั่วไป") || text.includes("คณิต") || text.includes("เหตุผล")) subjectAttempts.math.push(score);
      else if (text.includes("คอม") || text.includes("ไอที") || text.includes("เทคโนโลยี")) subjectAttempts.com.push(score);
      else if (text.includes("กฎหมาย") || text.includes("กฏหมาย") || text.includes("กม")) subjectAttempts.law.push(score);
      else if (text.includes("สังคม") || text.includes("จริยธรรม")) subjectAttempts.social.push(score);
      else if (text.includes("อังกฤษ") || text.includes("english") || text.includes("eng")) subjectAttempts.eng.push(score);
    });

    const getSubjectStats = (scores: number[], fallback: number) => {
      const count = scores.length;
      if (count > 0) {
        // Average score of all attempts in this subject
        const avg = Math.round(scores.reduce((a, b) => a + b, 0) / count);
        return { count, score: avg };
      }
      return { count: fallback > 0 ? 1 : 0, score: fallback || 0 };
    };

    const thaiStat = getSubjectStats(subjectAttempts.thai, dbUser.scoreThai);
    const mathStat = getSubjectStats(subjectAttempts.math, dbUser.scoreGeneral);
    const comStat = getSubjectStats(subjectAttempts.com, dbUser.scoreComputer);
    const lawStat = getSubjectStats(subjectAttempts.law, dbUser.scoreLaw);
    const socialStat = getSubjectStats(subjectAttempts.social, dbUser.scoreSocial);
    const engStat = getSubjectStats(subjectAttempts.eng, dbUser.scoreEnglish);

    const scoreThai = thaiStat.score;
    const scoreGeneral = mathStat.score;
    const scoreCom = comStat.score;
    const scoreLaw = lawStat.score;
    const scoreSocial = socialStat.score;
    const scoreEng = engStat.score;

    const scoresList = [scoreThai, scoreGeneral, scoreCom, scoreLaw, scoreSocial, scoreEng];
    const nonZeroScores = scoresList.filter((s) => s > 0);

    const averageScore =
      nonZeroScores.length > 0
        ? Math.round(nonZeroScores.reduce((a, b) => a + b, 0) / nonZeroScores.length)
        : attempts.length > 0
        ? Math.round(attempts.reduce((sum, item) => sum + (item.scorePct || 0), 0) / attempts.length)
        : 0;

    const maxScore = Math.max(
      ...scoresList,
      ...attempts.map((a) => a.scorePct || 0),
      0
    );

    const completedSets = attempts.length > 0 ? attempts.length : nonZeroScores.length;

    // Check incorrect questions count for Spaced Repetition Review
    const incorrectCount = await prisma.incorrectQuestion.count({
      where: {
        userId: dbUser.id,
        isMastered: false,
      },
    });

    // Compute Smart Priority Waterfall Recommendation
    let recommendation = {
      badge: "คำแนะนำวันนี้",
      title: "ฝึกทำข้อสอบสายอำนวยการ",
      description: "ตะลุยโจทย์ย้อนหลังชุดข้อสอบจริง 150 ข้อ จับเวลาจริงเพื่อฝึกสปีดความเร็ว",
      buttonText: "เริ่มทำข้อสอบทันที",
      actionUrl: `/exam/session?mode=pretest_admin&title=${encodeURIComponent("Pretest สายอำนวยการ 150 ข้อ")}`,
    };

    if (completedSets === 0 && nonZeroScores.length === 0) {
      // Priority 1: New user (0 completed exams)
      recommendation = {
        badge: "เริ่มต้นครั้งแรก",
        title: "ทดสอบวัดระดับครั้งแรก (Pretest 150 ข้อ)",
        description: "ลองทำข้อสอบเสมือนจริง 1 ชุด เพื่อให้ระบบช่วยวิเคราะห์ว่าคุณเก่งวิชาไหน และต้องเสริมวิชาไหน",
        buttonText: "เริ่มทำข้อสอบชุดแรก",
        actionUrl: `/exam/session?mode=pretest_suppression&title=${encodeURIComponent("Pretest สายปราบปราม 150 ข้อ")}`,
      };
    } else if (incorrectCount > 0) {
      // Priority 2: Has incorrect questions to review
      recommendation = {
        badge: `ทบทวนข้อผิดพลาด (${incorrectCount} ข้อ)`,
        title: `ทบทวนข้อสอบที่เคยตอบผิด ${incorrectCount} ข้อ`,
        description: "คุณมีข้อสอบที่เคยตอบผิดค้างอยู่ การแก้ข้อที่เคยผิดคือวิธีที่ช่วยดันคะแนนขึ้นได้ไวที่สุด",
        buttonText: "ฝึกแก้ข้อที่เคยผิด",
        actionUrl: `/exam/session?mode=review_incorrect&title=${encodeURIComponent(`ฝึกแก้ข้อสอบที่เคยตอบผิด (${incorrectCount} ข้อ)`)}`,
      };
    } else {
      // Priority 3: Check for subjects with score < 60%
      const subjectsList = [
        { id: "thai", name: "ภาษาไทย", score: scoreThai },
        { id: "math", name: "ความสามารถทั่วไป", score: scoreGeneral },
        { id: "com", name: "คอมพิวเตอร์", score: scoreCom },
        { id: "law", name: "กฎหมาย", score: scoreLaw },
        { id: "social", name: "สังคม", score: scoreSocial },
        { id: "eng", name: "ภาษาอังกฤษ", score: scoreEng },
      ];

      // Sort by score ascending to find weakest subject
      const lowest = [...subjectsList].sort((a, b) => a.score - b.score)[0];

      if (lowest && lowest.score < 60) {
        const catKeyMap: Record<string, { key: string; name: string }> = {
          thai: { key: "ภาษาไทย", name: "ภาษาไทย" },
          math: { key: "ทั่วไป", name: "ความสามารถทั่วไป" },
          com: { key: "คอม", name: "คอมพิวเตอร์และสารสนเทศ" },
          law: { key: "กฏหมาย", name: "กฎหมายที่ประชาชนควรรู้" },
          social: { key: "สังคม", name: "สังคมและวัฒนธรรม" },
          eng: { key: "ภาษาอังกฤษ", name: "ภาษาอังกฤษ" },
        };
        const selected = catKeyMap[lowest.id] || { key: "ภาษาไทย", name: "ภาษาไทย" };
        recommendation = {
          badge: "เน้นแก้จุดอ่อนด่วน",
          title: `เจาะลึกวิชา${lowest.name}`,
          description: `คะแนนวิชานี้อยู่ที่ ${lowest.score}% ยังไม่ผ่านเกณฑ์ 60% แนะนำให้เน้นตะลุยโจทย์หมวดนี้เพื่อไม่ให้ตกเกณฑ์`,
          buttonText: `เริ่มฝึกวิชา${lowest.name}`,
          actionUrl: `/exam/session?mode=subject_single&category=${encodeURIComponent(selected.key)}&title=${encodeURIComponent(selected.name)}`,
        };
      } else {
        // Priority 4: All >= 60%
        recommendation = {
          badge: "คะแนนผ่านเกณฑ์แล้ว",
          title: "ฝึกจับเวลาสปีด 3 ชั่วโมงเต็ม",
          description: "คะแนนของคุณอยู่ในเกณฑ์ดีแล้ว ลองฝึกจับเวลา 150 ข้อเพื่อฝึกความเร็วและไต่อันดับท็อปของประเทศ",
          buttonText: "เข้าสอบจับเวลาจริง",
          actionUrl: `/exam/session?mode=pretest_suppression&title=${encodeURIComponent("Pretest สายปราบปราม 150 ข้อ")}`,
        };
      }
    }

    const userName =
      dbUser.fullName && dbUser.fullName.trim().length > 0
        ? dbUser.fullName
        : dbUser.username || null;

    return NextResponse.json({
      userName,
      role: dbUser.role || "USER",
      completedSets,
      averageScore,
      maxScore,
      incorrectCount,
      recommendation,
      subjects: {
        thai: thaiStat,
        math: mathStat,
        com: comStat,
        law: lawStat,
        social: socialStat,
        eng: engStat,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error in /api/user/stats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
