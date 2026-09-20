"use client";

import React, { useState } from "react";

const THAI_LETTERS = ["ก", "ข", "ค", "ง"];

export interface QuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  chapter?: string;
  questionText: string;
  choices: string[];
  correctAnswer?: number; // 0=ก, 1=ข, 2=ค, 3=ง
  selectedChoice?: number;
  isReviewMode?: boolean;
  explanation?: string;
  reference?: string;
  onSelectChoice?: (choiceIndex: number) => void;
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

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber = 1,
  totalQuestions = 1,
  chapter,
  questionText,
  choices,
  correctAnswer,
  selectedChoice: controlledSelectedChoice,
  isReviewMode = false,
  explanation,
  reference,
  onSelectChoice,
}) => {
  // Local state fallback if not controlled externally
  const [internalSelected, setInternalSelected] = useState<number | undefined>(undefined);
  const selectedIndex = controlledSelectedChoice !== undefined ? controlledSelectedChoice : internalSelected;

  const handleSelect = (idx: number) => {
    if (isReviewMode) return;
    setInternalSelected(idx);
    if (onSelectChoice) {
      onSelectChoice(idx);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 font-sans transition-all">
      {/* Question Header & Subject Badge */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-100">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs sm:text-sm font-bold text-[#BD1B0B]">
          <span>ข้อที่ {questionNumber}</span>
          {totalQuestions > 1 && <span className="text-red-400 font-normal">/ {totalQuestions} ข้อ</span>}
        </div>

        {chapter && (
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg truncate max-w-[200px]">
            {chapter}
          </span>
        )}
      </div>

      {/* Question Text & Passage */}
      {(() => {
        const parsed = parseQuestionContent(questionText);
        if (parsed.passage) {
          return (
            <div className="space-y-3 mb-6">
              {parsed.instruction && (
                <p className="text-xs sm:text-sm font-bold text-slate-700 leading-snug">
                  {parsed.instruction}
                </p>
              )}
              <div className="rounded-2xl bg-[#F8FAFD] border border-blue-100/90 border-l-[5px] border-l-[#2563EB] p-4 sm:p-5 shadow-2xs">
                <p className="text-slate-800 text-sm sm:text-base font-normal leading-relaxed sm:leading-loose font-passage select-text whitespace-pre-line">
                  {parsed.passage}
                </p>
              </div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-snug pt-1">
                {parsed.question}
              </h2>
            </div>
          );
        }
        return (
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-6">
            {questionText}
          </h2>
        );
      })()}

      {/* 4 Choices (ก, ข, ค, ง) */}
      <div className="space-y-3">
        {choices.map((choiceText, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = correctAnswer !== undefined && idx === correctAnswer;

          let btnStyle =
            "w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border font-medium transition-all flex items-center gap-3.5 sm:gap-4 cursor-pointer active:scale-[0.99] touch-manipulation ";
          let badgeStyle =
            "w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0 transition-all ";

          if (isReviewMode) {
            if (isCorrect) {
              // ข้อที่ถูกต้อง (สีเขียวมรกต)
              btnStyle += "bg-emerald-50 border-2 border-emerald-600 text-emerald-950 font-bold shadow-xs";
              badgeStyle += "bg-emerald-600 text-white shadow-xs";
            } else if (isSelected) {
              // ข้อที่ผู้เรียนตอบผิด (สีแดง)
              btnStyle += "bg-red-50 border-2 border-red-600 text-red-950 font-bold shadow-xs";
              badgeStyle += "bg-red-600 text-white shadow-xs";
            } else {
              // ข้ออื่นๆ ที่ไม่ได้ตอบ
              btnStyle += "bg-white border-slate-200 text-slate-400 opacity-60";
              badgeStyle += "bg-slate-100 text-slate-400";
            }
          } else {
            // โหมดทำข้อสอบปกติ
            if (isSelected) {
              // ตัวเลือกที่กดเลือก (สไตล์ V2 ตาม Blueprint: กรอบแดงเลือดหมู พื้นหลังแดงอ่อน)
              btnStyle += "bg-red-50 border-2 border-[#BD1B0B] text-red-950 font-bold shadow-sm";
              badgeStyle += "bg-[#BD1B0B] text-white shadow-xs";
            } else {
              // ตัวเลือกปกติ (สีขาว คลีนๆ)
              btnStyle += "bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-slate-50/80";
              badgeStyle += "bg-slate-100 text-slate-600";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isReviewMode}
              onClick={() => handleSelect(idx)}
              className={btnStyle}
            >
              <div className={badgeStyle}>{THAI_LETTERS[idx]}</div>
              <span className="flex-1 text-sm sm:text-base leading-snug">{choiceText}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Review Mode Only) */}
      {isReviewMode && explanation && (
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs sm:text-sm leading-relaxed animate-fade-in">
          <div className="font-extrabold mb-1.5 flex items-center gap-1.5 text-amber-900">
            <span>คำอธิบายเฉลยละเอียด:</span>
          </div>
          <p className="text-slate-700 leading-relaxed">{explanation}</p>
          {reference && (
            <div className="mt-3 pt-2.5 border-t border-amber-200/60 text-[11px] sm:text-xs text-amber-800 font-semibold">
              แหล่งอ้างอิง: {reference}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
