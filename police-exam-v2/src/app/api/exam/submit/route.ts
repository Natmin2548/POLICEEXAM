import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, subject, setTitle, answers, timeSpentSeconds } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "Missing answers" }, { status: 400 });
    }

    const questionIds = Object.keys(answers).map((id) => parseInt(id, 10));

    if (questionIds.length === 0) {
      return NextResponse.json({ error: "No answers provided" }, { status: 400 });
    }

    // Fetch real questions with answers and explanations
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
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

    let correctCount = 0;
    const detailedResults: any[] = [];
    const wrongQuestionIds: number[] = [];

    questions.forEach((q) => {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctAnswer;

      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestionIds.push(q.id);
      }

      detailedResults.push({
        id: q.id,
        questionText: q.questionText,
        choices: [q.choice1, q.choice2, q.choice3, q.choice4],
        userAnswer: userChoice ?? null,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || "ไม่มีคำอธิบายเพิ่มเติมสำหรับข้อนี้",
        category: q.examSet?.category || "",
      });
    });

    const totalQuestions = questions.length;
    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePct >= 60;

    // Record attempt if user exists
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
        // 1. Create QuizAttempt record
        await prisma.quizAttempt.create({
          data: {
            userId: dbUser.id,
            subject: subject || "แบบทดสอบรายวิชา",
            setTitle: setTitle || `ชุดข้อสอบ ${totalQuestions} ข้อ`,
            scorePct,
            correctCount,
            totalQuestions,
          },
        });

        // 2. Update user subject score in User model
        const subStr = `${subject || ""} ${setTitle || ""}`.toLowerCase();
        const updateData: any = {};

        if (subStr.includes("pretest") || totalQuestions >= 100) {
          // In a pretest, calculate score per category
          const categoryCounts: Record<string, { correct: number; total: number }> = {};
          detailedResults.forEach((r) => {
            const cat = (r.category || "").toLowerCase();
            let key = "";
            if (cat.includes("ไทย")) key = "scoreThai";
            else if (cat.includes("ทั่วไป") || cat.includes("คณิต") || cat.includes("เหตุผล")) key = "scoreGeneral";
            else if (cat.includes("คอม") || cat.includes("ไอที")) key = "scoreComputer";
            else if (cat.includes("กฎหมาย") || cat.includes("กฏหมาย")) key = "scoreLaw";
            else if (cat.includes("สังคม")) key = "scoreSocial";
            else if (cat.includes("อังกฤษ")) key = "scoreEnglish";
            else if (cat.includes("สารบรรณ") || cat.includes("๕๔") || cat.includes("54")) key = "scoreSecretariat";

            if (key) {
              if (!categoryCounts[key]) categoryCounts[key] = { correct: 0, total: 0 };
              categoryCounts[key].total++;
              if (r.isCorrect) categoryCounts[key].correct++;
            }
          });

          Object.entries(categoryCounts).forEach(([k, v]) => {
            if (v.total > 0) {
              updateData[k] = Math.round((v.correct / v.total) * 100);
            }
          });
        } else {
          // Single subject test
          if (subStr.includes("ไทย")) updateData.scoreThai = scorePct;
          else if (subStr.includes("ทั่วไป") || subStr.includes("คณิต") || subStr.includes("เหตุผล")) updateData.scoreGeneral = scorePct;
          else if (subStr.includes("คอม") || subStr.includes("ไอที") || subStr.includes("เทคโนโลยี")) updateData.scoreComputer = scorePct;
          else if (subStr.includes("กฎหมาย") || subStr.includes("กฏหมาย") || subStr.includes("กม")) updateData.scoreLaw = scorePct;
          else if (subStr.includes("สังคม") || subStr.includes("จริยธรรม")) updateData.scoreSocial = scorePct;
          else if (subStr.includes("อังกฤษ") || subStr.includes("english") || subStr.includes("eng")) updateData.scoreEnglish = scorePct;
          else if (subStr.includes("สารบรรณ") || subStr.includes("๕๔") || subStr.includes("54")) updateData.scoreSecretariat = scorePct;
        }

        if (Object.keys(updateData).length > 0) {
          try {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: updateData,
            });
          } catch (err) {
            console.error("Error updating user subject scores:", err);
          }
        }

        // 3. Record incorrect questions for Spaced Repetition Review
        for (const wrongId of wrongQuestionIds) {
          try {
            await prisma.incorrectQuestion.upsert({
              where: {
                userId_questionId: {
                  userId: dbUser.id,
                  questionId: wrongId,
                },
              },
              create: {
                userId: dbUser.id,
                questionId: wrongId,
                wrongCount: 1,
                isMastered: false,
              },
              update: {
                wrongCount: { increment: 1 },
                isMastered: false,
              },
            });
          } catch (err) {
            console.error("Error upserting incorrect question:", err);
          }
        }

        // 4. Mark questions that were previously wrong and now answered correctly as mastered
        const correctQuestionIds = detailedResults
          .filter((r) => r.isCorrect)
          .map((r) => r.id);

        if (correctQuestionIds.length > 0) {
          try {
            await prisma.incorrectQuestion.updateMany({
              where: {
                userId: dbUser.id,
                questionId: { in: correctQuestionIds },
                isMastered: false,
              },
              data: {
                isMastered: true,
                lastReviewedAt: new Date(),
              },
            });
          } catch (err) {
            console.error("Error updating mastered incorrect questions:", err);
          }
        }
      }
    }

    return NextResponse.json({
      scorePct,
      correctCount,
      totalQuestions,
      passed,
      timeSpentSeconds: timeSpentSeconds || 0,
      detailedResults,
    });
  } catch (error: any) {
    console.error("Error evaluating exam:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
