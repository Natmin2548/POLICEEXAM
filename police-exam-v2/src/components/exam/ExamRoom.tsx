"use client";

import React, { useEffect, useState } from "react";
import { useExamStore } from "@/stores/useExamStore";
import { QuestionCard } from "./QuestionCard";
import { Question } from "@/types/exam";
import { ArrowLeft, Clock, CheckCircle, RotateCcw, Award } from "lucide-react";

interface ExamRoomProps {
  title: string;
  onExit: () => void;
  questions?: Question[];
}

const SAMPLE_PRETEST_QUESTIONS: Question[] = [
  {
    id: 1,
    subject: "THAI",
    chapter: "วิเคราะห์บทความ",
    questionText: "ข้อความต่อไปนี้ผู้เขียนมีจุดประสงค์หลักตามข้อใด? 'การฝึกวินัยไม่ใช่การลงโทษ แต่คือการสร้างเข็มทิศให้กับชีวิต เพื่อให้สามารถเดินไปข้างหน้าได้อย่างมั่นคง'",
    choices: [
      "ก. อธิบายความหมายและคุณค่าที่แท้จริงของวินัย",
      "ข. ตักเตือนผู้ที่ไม่รักษาระเบียบวินัยในสังคม",
      "ค. เปรียบเทียบวิธีการลงโทษกับการฝึกวินัย",
      "ง. ชี้แนะแนวทางในการเลือกซื้อเข็มทิศนำทาง",
    ],
    correctAnswer: 0,
    explanation: "ผู้เขียนต้องการอธิบายให้เห็นว่าวินัยคือสิ่งชี้นำชีวิต (เข็มทิศ) ไม่ใช่เรื่องของการลงโทษ จึงตรงกับข้อ ก.",
  },
  {
    id: 2,
    subject: "MATH_GENERAL",
    chapter: "อนุกรมตัวเลข",
    questionText: "จงหาตัวเลขถัดไปของอนุกรม: 3, 7, 15, 31, 63, ...",
    choices: [
      "ก. 120",
      "ข. 127",
      "ค. 128",
      "ง. 135",
    ],
    correctAnswer: 1,
    explanation: "รูปแบบคือ เพิ่มขึ้นทีละ +4, +8, +16, +32, +64 ดังนั้น 63 + 64 = 127 (หรือสูตร 2n + 1)",
  },
  {
    id: 3,
    subject: "COMPUTER_SOC",
    chapter: "ความรู้พื้นฐานคอมพิวเตอร์",
    questionText: "ใครได้รับการยกย่องให้เป็น 'บิดาแห่งคอมพิวเตอร์' (Father of Computers)?",
    choices: [
      "ก. Charles Babbage (ชาร์ลส์ แบบเบจ)",
      "ข. Alan Turing (แอลัน ทัวริง)",
      "ค. John von Neumann (จอห์น ฟอน นอยมันน์)",
      "ง. Blaise Pascal (แบลส ปัสกาล)",
    ],
    correctAnswer: 0,
    explanation: "Charles Babbage เป็นผู้ออกแบบเครื่อง Difference Engine และ Analytical Engine จึงได้รับการยกย่องเป็นบิดาแห่งคอมพิวเตอร์",
  },
  {
    id: 4,
    subject: "POLICE_LAW",
    chapter: "พ.ร.บ.ตำรวจแห่งชาติ 2565",
    questionText: "ตาม พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. 2565 ใครเป็นประธานกรรมการนโยบายตำรวจแห่งชาติ (ก.ต.ช.)?",
    choices: [
      "ก. ผู้บัญชาการตำรวจแห่งชาติ (ผบ.ตร.)",
      "ข. นายกรัฐมนตรี",
      "ค. รัฐมนตรีว่าการกระทรวงมหาดไทย",
      "ง. ปลัดกระทรวงยุติธรรม",
    ],
    correctAnswer: 1,
    explanation: "ตามกฎหมายกำหนดให้นายกรัฐมนตรีทำหน้าที่เป็นประธาน ก.ต.ช. โดยตำแหน่ง",
  },
  {
    id: 5,
    subject: "POLICE_RULES",
    chapter: "ระเบียบสำนักนายกฯ",
    questionText: "หนังสือราชการมีทั้งหมดกี่ชนิด ตามระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ?",
    choices: [
      "ก. 4 ชนิด",
      "ข. 5 ชนิด",
      "ค. 6 ชนิด",
      "ง. 7 ชนิด",
    ],
    correctAnswer: 2,
    explanation: "หนังสือราชการมี 6 ชนิด ได้แก่ หนังสือภายนอก, หนังสือภายใน, หนังสือประทับตรา, หนังสือสั่งการ, หนังสือประชาสัมพันธ์, และหนังสือที่เจ้าหน้าที่ทำขึ้นหรือรับไว้เป็นหลักฐานในราชการ",
  },
];

export const ExamRoom: React.FC<ExamRoomProps> = ({
  title,
  onExit,
  questions = SAMPLE_PRETEST_QUESTIONS,
}) => {
  const {
    currentIndex,
    userAnswers,
    isSubmitted,
    isReviewMode,
    remainingSeconds,
    totalSeconds,
    initExam,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    startReview,
    decrementTimer,
    getScore,
  } = useExamStore();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Initialize Exam Session on mount (Fetch from Database API)
  useEffect(() => {
    if (questions && questions.length > 0) {
      initExam(questions, 5400);
      return;
    }

    // Dynamic Fetch from Database API based on title or category
    fetch(`/api/exams`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          // Find matching set or take first set
          const targetSet =
            data.data.find(
              (s: any) =>
                s.title.includes(title) ||
                title.includes(s.category) ||
                title.includes(s.title)
            ) || data.data[0];

          fetch(`/api/exams/${targetSet.id}`)
            .then((r) => r.json())
            .then((detail) => {
              if (detail.success && detail.data?.questions?.length > 0) {
                const formatted: Question[] = detail.data.questions.map((q: any) => ({
                  id: q.id,
                  subject: detail.data.category || "GENERAL",
                  chapter: detail.data.subcategory || "หมวดข้อสอบมาตรฐาน",
                  questionText: q.questionText,
                  choices: [q.choice1, q.choice2, q.choice3, q.choice4],
                  correctAnswer: (q.correctAnswer || 1) - 1,
                  explanation: q.explanation || "",
                }));
                initExam(formatted, 5400);
              } else {
                initExam(SAMPLE_PRETEST_QUESTIONS, 5400);
              }
            })
            .catch(() => initExam(SAMPLE_PRETEST_QUESTIONS, 5400));
        } else {
          initExam(SAMPLE_PRETEST_QUESTIONS, 5400);
        }
      })
      .catch(() => initExam(SAMPLE_PRETEST_QUESTIONS, 5400));
  }, [questions, title, initExam]);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, decrementTimer]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}:` : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const scoreResult = getScore();
  const answeredCount = Object.keys(userAnswers).length;

  // Render Result / Score Screen
  if (isSubmitted && !isReviewMode) {
    const isPassed = scoreResult.percentage >= 60;

    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 flex flex-col items-center justify-center animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 text-center shadow-lg border border-slate-100">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
              isPassed
                ? "bg-emerald-50 text-emerald-600 shadow-md shadow-emerald-600/20"
                : "bg-rose-50 text-police-800 shadow-md shadow-rose-900/20"
            }`}
          >
            <Award className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1">
            {isPassed ? "🎉 สอบผ่านเกณฑ์!" : "พยายามอีกนิดนะ!"}
          </h2>
          <p className="text-xs text-slate-400 font-medium mb-6">{title}</p>

          {/* Score Badge */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6">
            <div className="text-4xl font-black text-police-800 leading-none mb-1">
              {scoreResult.score}{" "}
              <span className="text-xl text-slate-400 font-bold">/ {scoreResult.total}</span>
            </div>
            <div className="text-sm font-extrabold text-slate-700 mt-2">
              คิดเป็น {scoreResult.percentage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              (เกณฑ์ผ่านคือ 60% ขึ้นไป)
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={startReview}
              className="w-full py-3.5 rounded-xl bg-police-800 hover:bg-police-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer"
            >
              🔍 ตรวจเฉลยละเอียดทุกข้อ
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>กลับสู่หน้าหลัก</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 flex flex-col font-sans">
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 h-16 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-police-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ออก</span>
        </button>

        <div className="text-center truncate px-2">
          <h1 className="text-sm font-black text-slate-900 truncate max-w-[180px] sm:max-w-xs">
            {title}
          </h1>
          {isReviewMode ? (
            <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-md">
              โหมดตรวจเฉลย
            </span>
          ) : (
            <div className="flex items-center justify-center gap-1 text-xs font-bold text-police-800">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>
          )}
        </div>

        {isReviewMode ? (
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            เสร็จสิ้น
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmSubmit(true)}
            className="px-3.5 py-1.5 rounded-xl bg-police-800 hover:bg-police-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
          >
            ส่งข้อสอบ
          </button>
        )}
      </header>

      {/* Main Question Card Container */}
      <main className="max-w-2xl mx-auto w-full px-4 pt-4 flex-1 flex flex-col gap-4">
        {/* Question Component */}
        <QuestionCard />

        {/* Question Navigator Grid */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500">
            <span>แผงเลือกข้อ</span>
            <span>
              ตอบแล้ว {answeredCount}/{questions.length} ข้อ
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = userAnswers[idx] !== undefined;
              const isCorrect = userAnswers[idx] === q.correctAnswer;

              let btnClass = "h-9 rounded-xl font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer ";

              if (isReviewMode) {
                if (isCorrect) {
                  btnClass += "bg-emerald-600 text-white shadow-2xs";
                } else {
                  btnClass += "bg-red-600 text-white shadow-2xs";
                }
              } else {
                if (isCurrent) {
                  btnClass += "bg-police-800 text-white ring-2 ring-police-800/30 shadow-xs";
                } else if (isAnswered) {
                  btnClass += "bg-rose-50 text-police-800 border border-police-800/30";
                } else {
                  btnClass += "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToQuestion(idx)}
                  className={btnClass}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center gap-3 mt-auto pt-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={prevQuestion}
            className="flex-1 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-sm disabled:opacity-40 hover:bg-slate-50 transition-all cursor-pointer"
          >
            ← ข้อก่อนหน้า
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={nextQuestion}
              className="flex-1 py-3 rounded-xl bg-police-800 hover:bg-police-700 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer"
            >
              ข้อถัดไป →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ส่งคำตอบ</span>
            </button>
          )}
        </div>
      </main>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-900 mb-1.5">
              ยืนยันการส่งข้อสอบ?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              คุณทำข้อสอบไปแล้ว {answeredCount} จากทั้งหมด {questions.length} ข้อ
              {answeredCount < questions.length && (
                <span className="block text-police-800 font-bold mt-1">
                  (ยังเหลืออีก {questions.length - answeredCount} ข้อที่ยังไม่ได้ตอบ)
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                ทำต่อ
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmSubmit(false);
                  submitExam();

                  // Save real attempt to database
                  try {
                    const savedUser =
                      typeof window !== "undefined"
                        ? localStorage.getItem("police_exam_user")
                        : null;
                    const u = savedUser ? JSON.parse(savedUser) : null;
                    const result = getScore();

                    await fetch("/api/exams/submit", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: u?.id || 1,
                        title,
                        category: title.includes("ปราบปราม")
                          ? "สายปราบปราม"
                          : title.includes("อำนวยการ")
                          ? "สายอำนวยการ"
                          : "ทั่วไป",
                        score: result.score,
                        totalScore: result.total,
                        timeSpent: totalSeconds - remainingSeconds,
                        answersJson: userAnswers,
                      }),
                    });
                  } catch (err) {
                    console.error("Error saving attempt:", err);
                  }
                }}
                className="flex-1 py-3 rounded-xl bg-police-800 hover:bg-police-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                ยืนยันส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
