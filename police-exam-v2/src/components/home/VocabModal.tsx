"use client";

import React, { useEffect, useState, useMemo } from "react";
import { X, BookOpen, RotateCcw, Check, Sparkles, Award } from "lucide-react";
import { VOCAB_DATA, VocabWord } from "@/data/vocabData";

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

const LEVELS: { key: CEFRLevel; title: string; subtitle: string; count: number; badgeBg: string; badgeText: string }[] = [
  {
    key: "A1",
    title: "A1 — เบื้องต้น",
    subtitle: "คำศัพท์พื้นฐานที่ใช้ในชีวิตประจำวัน",
    count: 600,
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-600",
  },
  {
    key: "A2",
    title: "A2 — ก่อนกลาง",
    subtitle: "คำศัพท์ที่ใช้สื่อสารทั่วไป",
    count: 600,
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-600",
  },
  {
    key: "B1",
    title: "B1 — กลาง",
    subtitle: "คำศัพท์เชิงวิชาการและธุรกิจ",
    count: 600,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-600",
  },
  {
    key: "B2",
    title: "B2 — สูงกลาง",
    subtitle: "คำศัพท์ระดับกลาง-สูงสำหรับข้อสอบแข่งขัน",
    count: 600,
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-600",
  },
  {
    key: "C1",
    title: "C1 — ระดับสูง",
    subtitle: "คำศัพท์ขั้นสูงเชิงวิเคราะห์และกฎหมาย",
    count: 600,
    badgeBg: "bg-rose-50",
    badgeText: "text-police-800",
  },
];

interface QuizItem {
  word: string;
  correctMeaning: string;
  choices: string[];
}

export const VocabModal: React.FC<VocabModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"setup" | "game" | "summary">("setup");
  const [wordCount, setWordCount] = useState<number>(10);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>("A1");

  // Game state
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setStep("setup");
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const startGame = (level: CEFRLevel) => {
    setSelectedLevel(level);
    const pool = VOCAB_DATA[level] || VOCAB_DATA["A1"] || [];
    if (pool.length === 0) return;

    // Shuffle pool and pick wordCount
    const shuffledWords = [...pool].sort(() => 0.5 - Math.random()).slice(0, wordCount);

    const generatedQuiz: QuizItem[] = shuffledWords.map((item) => {
      // Pick 3 random wrong meanings from the pool
      const distractors = pool
        .filter((w) => w.meaning !== item.meaning)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.meaning);

      const choices = [item.meaning, ...distractors].sort(() => 0.5 - Math.random());

      return {
        word: item.word,
        correctMeaning: item.meaning,
        choices,
      };
    });

    setQuizList(generatedQuiz);
    setCurrentIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedChoice(null);
    setIsAnswerChecked(false);
    setStep("game");
  };

  const handleSelectAnswer = (choice: string) => {
    if (isAnswerChecked || !quizList[currentIndex]) return;

    setSelectedChoice(choice);
    setIsAnswerChecked(true);

    const isCorrect = choice === quizList[currentIndex].correctMeaning;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        if (next > maxStreak) setMaxStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }

    // Auto advance after 450ms
    setTimeout(() => {
      if (currentIndex < quizList.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedChoice(null);
        setIsAnswerChecked(false);
      } else {
        setStep("summary");
      }
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[440px] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Selection Setup (Screenshot 1) */}
        {step === "setup" && (
          <div className="flex flex-col gap-5">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-black text-slate-900">
                  คลังคำศัพท์ภาษาอังกฤษ
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Word Count Selector */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2.5 block">
                จำนวนคำศัพท์ที่ต้องการฝึกฝน
              </label>
              <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-1 rounded-2xl">
                {[10, 20, 30].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setWordCount(cnt)}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      wordCount === cnt
                        ? "bg-white text-police-800 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {cnt} คำ
                  </button>
                ))}
              </div>
            </div>

            {/* CEFR Level Selection */}
            <div>
              <label className="text-xs font-bold text-slate-500 mb-2.5 block">
                เลือกความยากของคำศัพท์ภาษาอังกฤษ (CEFR)
              </label>

              <div className="flex flex-col gap-2.5">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => startGame(lvl.key)}
                    className="w-full text-left bg-white border border-slate-100 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between hover:border-slate-300 hover:shadow-xs active:scale-98 transition-all cursor-pointer group touch-manipulation"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${lvl.badgeBg} ${lvl.badgeText}`}
                      >
                        {lvl.key}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-police-800 transition-colors">
                          {lvl.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                          {lvl.subtitle}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 shrink-0">
                      {lvl.count} คำ
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Mini-game Quiz View (Screenshot 2) */}
        {step === "game" && quizList[currentIndex] && (
          <div className="flex flex-col gap-4">
            {/* Game Header */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] flex items-center gap-1 border border-purple-100">
                📊 สถิติ
              </span>

              <div className="flex flex-col items-center text-center">
                <div className="text-lg">📖</div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  Vocab ({selectedLevel})
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  มินิเกมฝึกคำศัพท์ภาษาอังกฤษสอบตำรวจ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep("setup")}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 KPI Stats Header */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center shadow-2xs">
              <div>
                <div className="text-lg font-black text-police-800 leading-none">
                  {correctCount}/{wordCount}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1">
                  ทำถูก
                </div>
              </div>
              <div className="border-x border-slate-100">
                <div className="text-lg font-black text-amber-500 leading-none">
                  {streak}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1">
                  Streak
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-800 leading-none">
                  {currentIndex + 1}/{wordCount}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 mt-1">
                  คำศัพท์ที่ทำ
                </div>
              </div>
            </div>

            {/* English Word Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 text-center shadow-xs flex flex-col items-center justify-center min-h-[160px]">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                {quizList[currentIndex].word}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                เลือกคำแปลภาษาไทยที่ถูกต้อง
              </p>
            </div>

            {/* 4 Choices Grid (2x2) */}
            <div className="grid grid-cols-2 gap-2.5">
              {quizList[currentIndex].choices.map((choiceText, idx) => {
                const isSelected = selectedChoice === choiceText;
                const isCorrect = choiceText === quizList[currentIndex].correctMeaning;

                let btnClass = "p-4 rounded-2xl border font-bold text-sm text-center transition-all cursor-pointer touch-manipulation min-h-[58px] flex items-center justify-center ";

                if (isAnswerChecked) {
                  if (isCorrect) {
                    btnClass += "bg-emerald-500 text-white border-emerald-500 shadow-sm";
                  } else if (isSelected) {
                    btnClass += "bg-red-500 text-white border-red-500 shadow-sm";
                  } else {
                    btnClass += "bg-slate-50 text-slate-400 border-slate-100 opacity-60";
                  }
                } else {
                  btnClass += "bg-white border-slate-200 text-slate-800 hover:border-slate-400 active:scale-95 shadow-2xs";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => handleSelectAnswer(choiceText)}
                    className={btnClass}
                  >
                    <span>{choiceText}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Game Summary */}
        {step === "summary" && (
          <div className="text-center flex flex-col items-center gap-4 py-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <Award className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900">จบมินิเกม!</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                ระดับ {selectedLevel} ({wordCount} คำ)
              </p>
            </div>

            {/* Score Box */}
            <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-3">
              <div>
                <div className="text-2xl font-black text-police-800">
                  {correctCount}/{wordCount}
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">
                  ความแม่นยำ {Math.round((correctCount / wordCount) * 100)}%
                </div>
              </div>
              <div className="border-l border-slate-200">
                <div className="text-2xl font-black text-amber-500">
                  {maxStreak}
                </div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">
                  Streak สูงสุด
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={() => startGame(selectedLevel)}
                className="w-full py-3 rounded-xl bg-police-800 hover:bg-police-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นระดับนี้อีกครั้ง</span>
              </button>

              <button
                type="button"
                onClick={() => setStep("setup")}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
              >
                เปลี่ยนระดับความยาก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
