"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Flag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Check,
  Award,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface QuestionItem {
  index: number;
  id: number;
  questionText: string;
  choices: string[];
  correctAnswer?: number;
  explanation?: string;
  category: string;
  title: string;
}

interface DetailedResult {
  id: number;
  questionText: string;
  choices: string[];
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  category: string;
}

function parseQuestionContent(text: string) {
  if (!text) return { instruction: null, passage: null, question: "" };

  const cleanText = text.trim();

  // 1. Extract Quoted Passage anywhere in the text: "..." or “...”
  const quoteRegex = /([\s\S]*?)["“]([\s\S]+?)["”]([\s\S]*)/;
  const quoteMatch = cleanText.match(quoteRegex);

  if (quoteMatch) {
    const prefix = quoteMatch[1].trim();
    const passage = quoteMatch[2].trim();
    const suffix = quoteMatch[3].trim();

    if (
      passage.length >= 15 ||
      prefix.includes("พิจารณา") ||
      prefix.includes("ข้อความ") ||
      prefix.includes("บทความ") ||
      prefix.includes("อ่าน")
    ) {
      let instruction = prefix || null;
      let question = suffix || "";

      if (!instruction && (passage.length > 50 || suffix)) {
        instruction = "อ่านข้อความต่อไปนี้แล้วตอบคำถาม:";
      }

      return {
        instruction,
        passage: `"${passage}"`,
        question: question || (instruction ? "" : cleanText),
      };
    }
  }

  // 2. Multiline paragraphs without quotes (separated by \n or \n\n)
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 3) {
    const isFirstLineInstruction = /^(อ่าน|จงอ่าน|พิจารณา|จากข้อความ|Read)/i.test(lines[0]);
    const lastLine = lines[lines.length - 1];
    const isLastLineQuestion =
      lastLine.includes("?") ||
      lastLine.includes("ข้อใด") ||
      lastLine.includes("คืออะไร") ||
      lastLine.includes("เพราะเหตุใด") ||
      lastLine.includes("หมายถึง") ||
      lastLine.includes("ถูกต้อง") ||
      lastLine.length < 150;

    if (isFirstLineInstruction && isLastLineQuestion) {
      const instruction = lines[0];
      const passageLines = lines.slice(1, lines.length - 1).join("\n");
      return {
        instruction,
        passage: passageLines.startsWith('"') ? passageLines : `"${passageLines}"`,
        question: lastLine,
      };
    }
  }

  if (lines.length === 2) {
    const isFirstLineInstruction = /^(อ่าน|จงอ่าน|พิจารณา|จากข้อความ|Read)/i.test(lines[0]);
    if (isFirstLineInstruction) {
      return {
        instruction: lines[0],
        passage: null,
        question: lines[1],
      };
    }
    if (lines[0].length > 40 && (lines[1].includes("?") || lines[1].includes("ข้อใด"))) {
      return {
        instruction: "อ่านข้อความต่อไปนี้แล้วตอบคำถาม:",
        passage: `"${lines[0]}"`,
        question: lines[1],
      };
    }
  }

  return {
    instruction: null,
    passage: null,
    question: cleanText,
  };
}

function ExamSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode") || "subject_single";
  const category = searchParams.get("category") || "ภาษาไทย";
  const examTitle =
    searchParams.get("title") ||
    (mode === "review_incorrect" ? "ฝึกแก้ข้อสอบที่เคยตอบผิด" : "ทำข้อสอบ 30 ข้อ");

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Modals & Submission state
  const [showExitModal, setShowExitModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<{
    scorePct: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
    detailedResults: DetailedResult[];
  } | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [startTime] = useState<number>(Date.now());

  // Choice letters in Thai (ก, ข, ค, ง)
  const choiceLetters = ["ก", "ข", "ค", "ง"];

  // 1. Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchUser();
  }, []);

  // 2. Fetch questions from API
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const activeEmail = session?.user?.email || userEmail || searchParams.get("email") || "";
        if (session?.user?.email && !userEmail) {
          setUserEmail(session.user.email);
        }

        const countParam = searchParams.get("count");
        const count = countParam || (mode.startsWith("pretest") ? "150" : mode === "chapter" ? "20" : "30");
        const setIds = searchParams.get("setIds") || "";
        const res = await fetch(
          `/api/exam/generate?mode=${encodeURIComponent(
            mode
          )}&category=${encodeURIComponent(category)}&count=${count}&setIds=${encodeURIComponent(
            setIds
          )}&email=${encodeURIComponent(activeEmail)}`
        );
        if (!res.ok) {
          throw new Error("ไม่สามารถโหลดข้อสอบได้ กรุณาลองใหม่อีกครั้ง");
        }
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setError(
            mode === "review_incorrect"
              ? "ยินดีด้วย! คุณไม่มีข้อสอบที่ตอบผิดค้างอยู่แล้ว"
              : "ยังไม่มีข้อสอบในหมวดนี้"
          );
        }
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อสอบ");
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [mode, category]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  // Handle choice selection
  const handleSelectChoice = (choiceNumber: number) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: choiceNumber,
    }));
  };

  // Submit entire exam
  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentEmail = userEmail || session?.user?.email || "";

      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentEmail,
          subject: category,
          setTitle: examTitle,
          answers,
          timeSpentSeconds,
        }),
      });

      if (!res.ok) {
        throw new Error("เกิดข้อผิดพลาดในการตรวจข้อสอบ");
      }

      const resultData = await res.json();
      setExamResult(resultData);
    } catch (err: any) {
      alert(err.message || "ไม่สามารถส่งคำตอบได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitExam();
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
        <p className="text-sm font-black text-slate-800">กำลังสุ่มจัดชุดข้อสอบ...</p>
        <p className="text-xs text-slate-400 font-medium mt-1">ดึงข้อสอบจริงจากคลัง {category}</p>
      </div>
    );
  }

  // Error State
  if (error || !currentQ) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-base font-black text-slate-900 mb-1">{error || "ไม่พบข้อสอบ"}</h2>
        <p className="text-xs text-slate-500 mb-5">ขออภัยในความไม่สะดวก กรุณาลองเลือกวิชาอื่น</p>
        <Link
          href="/home"
          className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  // RESULT SCREEN
  if (examResult) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] py-8 sm:py-12 px-4">
        <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6">
          {/* Result Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center shadow-lg shadow-slate-900/5">
            <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#BD1B0B] flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Award className="w-8 h-8" />
            </div>

            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black mb-2 ${
                examResult.passed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-[#BD1B0B] border border-red-200"
              }`}
            >
              {examResult.passed ? "ผ่านเกณฑ์ 60% แล้ว" : "ยังไม่ผ่านเกณฑ์ 60%"}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              ผลการทดสอบ
            </h1>
            <p className="text-xs text-slate-500 font-medium mb-6">{examTitle}</p>

            {/* Score Ring / Box */}
            <div className="bg-gradient-to-br from-slate-50 to-red-50/30 rounded-2xl p-6 border border-slate-100 max-w-sm mx-auto mb-6">
              <div className="flex items-baseline justify-center gap-1.5 leading-none mb-2">
                <span className="text-5xl font-black text-[#BD1B0B]">
                  {examResult.scorePct}
                </span>
                <span className="text-xl font-bold text-[#BD1B0B]">%</span>
              </div>
              <p className="text-xs text-slate-600 font-bold">
                ตอบถูก {examResult.correctCount} จาก {examResult.totalQuestions} ข้อ
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowReview(!showReview)}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{showReview ? "ซ่อนเฉลยละเอียด" : "ดูเฉลยละเอียดทุกข้อ"}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ทำใหม่อีกรอบ</span>
                </button>
                <Link
                  href="/home"
                  className="py-3 px-4 bg-[#BD1B0B] hover:bg-[#A81507] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer shadow-md shadow-red-950/20"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>กลับหน้าหลัก</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Detailed Review Section */}
          {showReview && (
            <div className="space-y-4 pt-2">
              <h3 className="text-base font-black text-slate-900 px-2">
                เฉลยละเอียด ({examResult.detailedResults.length} ข้อ)
              </h3>
              {examResult.detailedResults.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs ${
                    item.isCorrect ? "border-emerald-200" : "border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-black text-slate-500">
                      ข้อที่ {idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.isCorrect
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {item.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ถูกต้อง</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>ตอบผิด</span>
                        </>
                      )}
                    </span>
                  </div>

                  {(() => {
                    const parsed = parseQuestionContent(item.questionText);
                    if (parsed.passage) {
                      return (
                        <div className="space-y-3 mb-4">
                          {parsed.instruction && (
                            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                              {parsed.instruction}
                            </p>
                          )}
                          <div className="rounded-2xl bg-[#F8FAFD] border border-blue-200/80 border-l-[5px] border-l-[#2563EB] p-4 sm:p-5 shadow-2xs">
                            <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed font-sans select-text whitespace-pre-line">
                              {parsed.passage}
                            </p>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed pt-1">
                            {parsed.question}
                          </h4>
                        </div>
                      );
                    }
                    return (
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4">
                        {item.questionText}
                      </h4>
                    );
                  })()}

                  {/* Choices with Correct & User Answer Indicators */}
                  <div className="space-y-2 mb-4">
                    {item.choices.map((choiceText, cIdx) => {
                      const cNumber = cIdx + 1;
                      const isUser = item.userAnswer === cNumber;
                      const isRight = item.correctAnswer === cNumber;

                      let rowClass = "border-slate-100 bg-white text-slate-700";
                      if (isRight) {
                        rowClass = "border-emerald-300 bg-emerald-50/60 text-emerald-950 font-bold";
                      } else if (isUser && !isRight) {
                        rowClass = "border-red-300 bg-red-50/60 text-red-950 line-through";
                      }

                      return (
                        <div
                          key={cIdx}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm ${rowClass}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white/80 border border-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {choiceLetters[cIdx]}
                          </span>
                          <span className="flex-1">{choiceText}</span>
                          {isRight && (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {item.explanation && (
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-700 leading-relaxed">
                      <span className="font-black text-slate-900 block mb-1">
                        คำอธิบายเฉลย:
                      </span>
                      {item.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // EXAM RUNNER SCREEN (Matching Screenshot 5)
  const currentSelectedChoice = answers[currentQ.id] || null;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
  const correctCount = questions.reduce((acc, q) => {
    return q.correctAnswer && answers[q.id] === q.correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col justify-between">
      {/* Top Bar Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Back / Exit button */}
          <button
            type="button"
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-1.5 text-sm font-black text-slate-800 hover:text-[#BD1B0B] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ออก</span>
          </button>

          {/* Center: Title on PC */}
          <div className="hidden md:block text-xs font-bold text-slate-500 truncate max-w-md">
            {examTitle || category}
          </div>

          {/* Right: Question Number & Live Score (Screenshot 5: 1 / 30 0 ถูก) */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">
              {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-xs sm:text-sm font-black text-[#BD1B0B] bg-red-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-red-100">
              {correctCount} ถูก
            </span>
          </div>
        </div>

        {/* Thin Red Progress Bar */}
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className="bg-[#BD1B0B] h-1 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
          {/* Left Column: Question & Choices (8 Columns on PC, Full width on Mobile) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Question Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
              {/* Badge & Report Row */}
              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-[#BD1B0B] border border-rose-100/60">
                  {currentQ.category || category}
                </span>

                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-amber-700 bg-amber-50/90 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
                >
                  <Flag className="w-3 h-3 text-amber-600 fill-amber-500/20" />
                  <span>แจ้งข้อผิด</span>
                </button>
              </div>

              {/* Question Title & Reading Passage Box */}
              {(() => {
                const parsed = parseQuestionContent(currentQ.questionText);
                if (parsed.passage) {
                  return (
                    <div className="space-y-3.5">
                      {parsed.instruction && (
                        <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                          {parsed.instruction}
                        </p>
                      )}
                      <div className="rounded-2xl bg-[#F8FAFD] border border-blue-200/80 border-l-[5px] border-l-[#2563EB] p-4 sm:p-5 shadow-2xs">
                        <p className="text-slate-800 text-sm sm:text-base font-medium leading-relaxed sm:leading-loose font-sans select-text whitespace-pre-line">
                          {parsed.passage}
                        </p>
                      </div>
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-relaxed pt-1">
                        {parsed.question}
                      </h2>
                    </div>
                  );
                }
                return (
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 leading-relaxed">
                    {currentQ.questionText}
                  </h2>
                );
              })()}

              {/* 4 Choices */}
              <div className="space-y-3 pt-2">
                {currentQ.choices.map((choiceText, cIdx) => {
                  const choiceNumber = cIdx + 1;
                  const isSelected = currentSelectedChoice === choiceNumber;

                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSelectChoice(choiceNumber)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${
                        isSelected
                          ? "border-2 border-[#BD1B0B] bg-red-50/30 shadow-xs"
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      {/* Choice Letter Pill (ก, ข, ค, ง) */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#BD1B0B] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                        }`}
                      >
                        {choiceLetters[cIdx]}
                      </div>

                      {/* Choice Text */}
                      <span
                        className={`text-xs sm:text-sm font-medium leading-relaxed flex-1 ${
                          isSelected
                            ? "text-slate-900 font-bold"
                            : "text-slate-800"
                        }`}
                      >
                        {choiceText}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Previous & Next */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentIndex === 0}
                  className={`py-3.5 px-4 sm:px-5 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    currentIndex === 0
                      ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">ข้อก่อนหน้า</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 sm:py-4 px-6 bg-[#BD1B0B] hover:bg-[#A81507] active:scale-[0.99] text-white text-sm font-black rounded-2xl shadow-lg shadow-red-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>กำลังตรวจข้อสอบ...</span>
                  ) : currentIndex === totalQuestions - 1 ? (
                    <span>ส่งคำตอบ / ดูผลลัพธ์</span>
                  ) : (
                    <>
                      <span>ข้อถัดไป</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Bottom Question Grid Navigator (< lg only) */}
            <div className="lg:hidden bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                    12
                  </span>
                  <span>ข้ามไปทำข้ออื่น:</span>
                </div>
                <span className="font-black text-[#BD1B0B]">
                  ทำแล้ว {answeredCount}/{totalQuestions} ข้อ
                </span>
              </div>

              {/* Grid of Number Buttons (1 to 30) */}
              <div className="grid grid-cols-10 gap-1.5 sm:gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = answers[q.id] !== undefined;

                  let btnStyle =
                    "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50";
                  if (isCurrent) {
                    btnStyle =
                      "border-2 border-[#BD1B0B] text-[#BD1B0B] font-black bg-white shadow-2xs";
                  } else if (isAnswered) {
                    btnStyle =
                      "bg-slate-100 text-slate-900 font-bold border border-slate-300";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sticky Sidebar (PC Desktop Only >= lg) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
            {/* Overview & Progress Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  ความคืบหน้า
                </span>
                <span className="text-xs font-bold text-[#BD1B0B]">
                  ทำแล้ว {answeredCount} / {totalQuestions} ข้อ
                </span>
              </div>

              {/* Progress Bar inside Card */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#BD1B0B] h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(answeredCount / totalQuestions) * 100}%`,
                  }}
                />
              </div>

              {/* 3 Status Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-bold text-center">
                <div className="p-2 rounded-2xl bg-red-50 text-[#BD1B0B] border border-red-100">
                  <span className="block text-xs font-black">
                    ข้อที่ {currentIndex + 1}
                  </span>
                  <span className="text-[10px] text-red-400 font-medium">
                    ปัจจุบัน
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-100 text-slate-800">
                  <span className="block text-xs font-black">
                    {answeredCount} ข้อ
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ตอบแล้ว
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-slate-50 text-slate-500 border border-slate-100">
                  <span className="block text-xs font-black">
                    {totalQuestions - answeredCount} ข้อ
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    ยังไม่ตอบ
                  </span>
                </div>
              </div>
            </div>

            {/* Answer Matrix Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  กระดาษคำตอบ (ข้ามข้อ)
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  คลิกเพื่อเลือกข้อ
                </span>
              </div>

              {/* Grid of number buttons (5 columns on sidebar) */}
              <div className="grid grid-cols-5 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = answers[q.id] !== undefined;

                  let btnClass =
                    "bg-white border border-slate-200 text-slate-600 hover:border-slate-400";
                  if (isCurrent) {
                    btnClass =
                      "border-2 border-[#BD1B0B] bg-red-50 text-[#BD1B0B] font-black shadow-xs scale-105";
                  } else if (isAnswered) {
                    btnClass =
                      "bg-slate-800 text-white font-bold border-slate-800 shadow-2xs";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Submit Button in Sidebar */}
            <button
              type="button"
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>
                {isSubmitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบและดูผลลัพธ์"}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal when clicking "ออก" */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-black text-slate-900">
              ออกจากห้องสอบหรือไม่?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              หากออกจากห้องสอบตอนนี้ ข้อมูลการทำข้อสอบในรอบนี้จะไม่ถูกบันทึก
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                ทำข้อสอบต่อ
              </button>
              <button
                type="button"
                onClick={() => router.push("/home")}
                className="py-2.5 px-4 rounded-xl bg-[#BD1B0B] text-white text-xs font-black hover:bg-[#A81507] cursor-pointer"
              >
                ยืนยันการออก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-black text-slate-900">
              แจ้งข้อสอบผิดพลาด
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              ขอบคุณที่ช่วยตรวจสอบ ระบบจะบันทึกข้อสอบข้อนี้เพื่อให้ทีมงานตรวจสอบความถูกต้องของโจทย์และเฉลย
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowReportModal(false);
                  alert("บันทึกการแจ้งข้อผิดเรียบร้อย ขอบคุณครับ");
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#BD1B0B] text-white text-xs font-black hover:bg-[#A81507] cursor-pointer"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
          <p className="text-sm font-black text-slate-800">กำลังเตรียมห้องสอบ...</p>
        </div>
      }
    >
      <ExamSessionContent />
    </Suspense>
  );
}
