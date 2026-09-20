import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Helper to randomly sample N items from an array
function sampleRandom<T>(items: T[], n: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "subject_single";
    const category = searchParams.get("category") || "ภาษาไทย";
    const count = parseInt(searchParams.get("count") || "30", 10);

    let catQuery = category;
    if (category.includes("กฎ") || category.includes("กฏ") || category.includes("หมาย")) {
      catQuery = "กฏหมาย";
    } else if (category.includes("คอม")) {
      catQuery = "คอม";
    } else if (category.includes("ไทย")) {
      catQuery = "ภาษาไทย";
    } else if (category.includes("อังกฤษ") || category.toLowerCase().includes("eng")) {
      catQuery = "ภาษาอังกฤษ";
    } else if (category.includes("ทั่วไป") || category.includes("ความสามารถ")) {
      catQuery = "ทั่วไป";
    } else if (category.includes("สังคม")) {
      catQuery = "สังคม";
    } else if (category.includes("๕๔") || category.includes("54") || category.includes("ตำรวจ")) {
      catQuery = "สารบรรณตำรวจ_๕๔";
    } else if (category.includes("สารบรรณ") || category.includes("๒๕๒๖") || category.includes("2526")) {
      catQuery = "งานสารบรรณ_๒๕๒๖";
    }

    let selectedQuestions: any[] = [];

    if (mode === "subject_single") {
      // 1. Find all question IDs for this category
      const questions = await prisma.question.findMany({
        where: {
          examSet: {
            category: {
              contains: catQuery,
              mode: "insensitive",
            },
          },
        },
        select: {
          id: true,
          questionText: true,
          choice1: true,
          choice2: true,
          choice3: true,
          choice4: true,
          correctAnswer: true,
          explanation: true,
          examSet: {
            select: {
              category: true,
              title: true,
            },
          },
        },
      });

      const sampled = sampleRandom(questions, Math.min(count, questions.length));
      selectedQuestions = sampled;
    } else if (mode === "pretest_suppression") {
      // Pretest สายปราบปราม (150 ข้อ)
      const distribution = [
        { category: "ทั่วไป", count: 30, subjectName: "ความสามารถทั่วไป" },
        { category: "ภาษาไทย", count: 25, subjectName: "ภาษาไทย" },
        { category: "ภาษาอังกฤษ", count: 30, subjectName: "ภาษาอังกฤษ" },
        { category: "กฏหมาย", count: 30, subjectName: "กฎหมายที่ประชาชนควรรู้" },
        { category: "คอม", count: 25, subjectName: "คอมพิวเตอร์และสารสนเทศ" },
        { category: "สังคม", count: 10, subjectName: "สังคมและวัฒนธรรม" },
      ];

      for (const dist of distribution) {
        const pool = await prisma.question.findMany({
          where: {
            examSet: {
              category: {
                contains: dist.category,
                mode: "insensitive",
              },
            },
          },
          select: {
            id: true,
            questionText: true,
            choice1: true,
            choice2: true,
            choice3: true,
            choice4: true,
            correctAnswer: true,
            explanation: true,
            examSet: {
              select: {
                category: true,
                title: true,
              },
            },
          },
        });
        const sampled = sampleRandom(pool, dist.count);
        selectedQuestions.push(...sampled);
      }
    } else if (mode === "pretest_admin") {
      // Pretest สายอำนวยการ (150 ข้อ)
      const distribution = [
        { category: "ทั่วไป", count: 30, subjectName: "ความสามารถทั่วไป" },
        { category: "ภาษาไทย", count: 25, subjectName: "ภาษาไทย" },
        { category: "ภาษาอังกฤษ", count: 30, subjectName: "ภาษาอังกฤษ" },
        { category: "คอม", count: 25, subjectName: "คอมพิวเตอร์และสารสนเทศ" },
        { category: "สังคม", count: 10, subjectName: "สังคมและวัฒนธรรม" },
        { category: "งานสารบรรณ_๒๕๒๖", count: 20, subjectName: "งานสารบรรณ (๒๕๒๖)" },
        { category: "สารบรรณตำรวจ_๕๔", count: 10, subjectName: "ระเบียบตำรวจ ลักษณะที่ ๕๔" },
      ];

      for (const dist of distribution) {
        const pool = await prisma.question.findMany({
          where: {
            examSet: {
              category: {
                contains: dist.category,
                mode: "insensitive",
              },
            },
          },
          select: {
            id: true,
            questionText: true,
            choice1: true,
            choice2: true,
            choice3: true,
            choice4: true,
            correctAnswer: true,
            explanation: true,
            examSet: {
              select: {
                category: true,
                title: true,
              },
            },
          },
        });
        const sampled = sampleRandom(pool, dist.count);
        selectedQuestions.push(...sampled);
      }
    } else if (mode === "chapter") {
      // Chapter exam from specific ExamSets
      const setIdsParam = searchParams.get("setIds");
      const ids = setIdsParam
        ? setIdsParam
            .split(",")
            .map((id) => parseInt(id, 10))
            .filter((n) => !isNaN(n))
        : [];

      if (ids.length > 0) {
        const chapterQuestions = await prisma.question.findMany({
          where: {
            examSetId: { in: ids },
          },
          select: {
            id: true,
            questionText: true,
            choice1: true,
            choice2: true,
            choice3: true,
            choice4: true,
            correctAnswer: true,
            explanation: true,
            examSet: {
              select: {
                category: true,
                title: true,
              },
            },
          },
          orderBy: { id: "asc" },
        });
        selectedQuestions = chapterQuestions;
      }
    } else if (mode === "review_incorrect") {
      const email = searchParams.get("email");
      let wrongQuestions: any[] = [];

      if (email) {
        const dbUser = await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive",
            },
          },
        });

        if (dbUser) {
          const incorrectRecords = await prisma.incorrectQuestion.findMany({
            where: {
              userId: dbUser.id,
              isMastered: false,
            },
            include: {
              question: {
                select: {
                  id: true,
                  questionText: true,
                  choice1: true,
                  choice2: true,
                  choice3: true,
                  choice4: true,
                  correctAnswer: true,
                  explanation: true,
                  examSet: {
                    select: {
                      category: true,
                      title: true,
                    },
                  },
                },
              },
            },
            orderBy: [{ wrongCount: "desc" }, { createdAt: "desc" }],
          });

          wrongQuestions = incorrectRecords
            .map((rec) => rec.question)
            .filter(Boolean);
        }
      }

      // If user has no unmastered questions or not logged in, fallback gracefully
      if (wrongQuestions.length === 0) {
        const fallback = await prisma.question.findMany({
          take: 10,
          select: {
            id: true,
            questionText: true,
            choice1: true,
            choice2: true,
            choice3: true,
            choice4: true,
            correctAnswer: true,
            explanation: true,
            examSet: {
              select: {
                category: true,
                title: true,
              },
            },
          },
        });
        wrongQuestions = fallback;
      }

      selectedQuestions = wrongQuestions;
    }

    // Format final list for client
    const formattedQuestions = selectedQuestions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      questionText: q.questionText,
      choices: [q.choice1, q.choice2, q.choice3, q.choice4],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "ไม่มีคำอธิบายเพิ่มเติมสำหรับข้อนี้",
      category: q.examSet?.category || category,
      title: q.examSet?.title || "",
    }));

    return NextResponse.json(
      {
        total: formattedQuestions.length,
        mode,
        questions: formattedQuestions,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating exam:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
