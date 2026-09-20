"use client";

import React, { useState } from "react";

const THAI_LETTERS = ["ก", "ข", "ค", "ง"];

export interface QuestionCardProps {
  questionNumber?: number;
  totalQuestions?: number;
  chapter?: string;
  category?: string;
  questionText: string;
  choices: string[];
  correctAnswer?: number; // 0=ก, 1=ข, 2=ค, 3=ง
  selectedChoice?: number;
  isReviewMode?: boolean;
  explanation?: string;
  reference?: string;
  onSelectChoice?: (choiceIndex: number) => void;
}

function parseQuestionContent(text: string, category?: string) {
  if (!text) return { instruction: null, passage: null, question: "" };

  const cleanText = text.trim();

  // Allowed subjects: ไทย, คอม, สังคม, สารบรรณ, กฎหมาย, อังกฤษ, ลักษณะที่ 54
  if (category) {
    const isAllowedSubject = /ไทย|คอม|สังคม|สารบรรณ|กฎหมาย|กฏหมาย|อังกฤษ|๕๔|54/i.test(category);
    if (!isAllowedSubject) {
      return { instruction: null, passage: null, question: cleanText };
    }
  }

  // Safety fallback for Math / General Ability questions (e.g. กำหนดให้, n(A))
  if (/^กำหนดให้|^ถ้า\s+\d+|n\(U\)|n\(A\)/i.test(cleanText)) {
    return { instruction: null, passage: null, question: cleanText };
  }

  // Helper: Format statements A. ... B. ... C. ... D. ... or 1. ... 2. ... cleanly on newlines ONLY when true statement list is present
  const formatPassageText = (str: string) => {
    let s = str.trim();
    // Only format if there's clear statement indicators (e.g. A. or ก. or 1. or (1) followed by B. or ข. or 2.)
    const hasStatements = /(?:[A|ก|1]|\(1\)|\(A\)|\(ก\))[\.\:\s]+[\s\S]+?(?:[B|ข|2]|\(2\)|\(B\)|\(ข\))[\.\:\s]+/i.test(s);
    if (hasStatements) {
      s = s.replace(/\s+([B-Dก-ง2-4]|\([2-4ก-งB-D]\))[\.\)\:]\s*/g, "\n$1. ");
    }
    return s;
  };

  const questionKeywords = [
    "ข้อความในข้อใด",
    "จากข้อความข้างต้น",
    "จากบทความข้างต้น",
    "จากข้อความ",
    "จากบทความ",
    "ข้อใดสรุป",
    "ข้อใดอนุมาน",
    "ข้อใด",
    "สรุป/อนุมาน",
    "สรุปได้ว่า",
    "อนุมานได้ว่า",
    "จงหา",
    "เท่าไหร่",
    "กี่",
    "คืออะไร",
    "เพราะเหตุใด",
    "หมายถึงอะไร",
    "ถูกต้อง",
    "Which of the following",
    "According to the text",
    "According to the conversation",
    "According to",
    "What is the main idea",
    "What is",
    "Why did",
    "Who is",
    "Where is",
    "How many",
  ];

  // 1. Explicit instruction prefix (e.g. "พิจารณาข้อความต่อไปนี้:", "อ่านบทความต่อไปนี้แล้วตอบคำถาม:")
  const instructionRegex = /^(พิจารณา[\s\S]*?[:：]|อ่าน[\s\S]*?[:：]|จงอ่าน[\s\S]*?[:：]|จาก[\s\S]*?[:：]|Read[\s\S]*?[:：]|Consider[\s\S]*?[:：])/i;
  const instMatch = cleanText.match(instructionRegex);

  if (instMatch) {
    const rawInstruction = instMatch[1].trim();
    let remaining = cleanText.slice(instMatch[0].length).trim();

    let instruction = rawInstruction;
    const trailingLabelMatch = rawInstruction.match(/(.*?\b(?:ต่อไปนี้|ตอบคำถาม|following)[:：]?)\s*([A-Dก-ง1-4]|\([1-4A-Dก-ง]\))[\.\s]?.*$/i);
    if (trailingLabelMatch) {
      instruction = trailingLabelMatch[1].trim();
      remaining = `${trailingLabelMatch[2]} ${remaining}`.trim();
    }

    let questionPart = "";
    let passagePart = remaining;

    let splitIdx = -1;
    for (const kw of questionKeywords) {
      const idx = remaining.lastIndexOf(kw);
      if (idx !== -1 && (splitIdx === -1 || idx > splitIdx)) {
        splitIdx = idx;
      }
    }

    if (splitIdx > 0) {
      passagePart = remaining.slice(0, splitIdx).trim();
      questionPart = remaining.slice(splitIdx).trim();
    }

    if (passagePart) {
      return {
        instruction,
        passage: formatPassageText(passagePart),
        question: questionPart || remaining,
      };
    }
  }

  // 2. Multi-statement question without explicit instruction (e.g., A. "..." B. "..." C. "..." D. "...")
  const isMultiStatement = /(?:[A|ก|1]|\(1\)|\(A\)|\(ก\))[\.\:\s]+[\s\S]+?(?:[B|ข|2]|\(2\)|\(B\)|\(ข\))[\.\:\s]+/i.test(cleanText);
  if (isMultiStatement) {
    let splitIdx = -1;
    for (const kw of questionKeywords) {
      const idx = cleanText.lastIndexOf(kw);
      if (idx !== -1 && (splitIdx === -1 || idx > splitIdx)) {
        splitIdx = idx;
      }
    }

    if (splitIdx > 0) {
      const passagePart = cleanText.slice(0, splitIdx).trim();
      const questionPart = cleanText.slice(splitIdx).trim();
      return {
        instruction: null,
        passage: formatPassageText(passagePart),
        question: questionPart,
      };
    }
  }

  // 3. Quoted Passage (e.g. "...")
  const quoteRegex = /([\s\S]*?)["“]([\s\S]+?)["”]([\s\S]*)/;
  const quoteMatch = cleanText.match(quoteRegex);

  if (quoteMatch) {
    const prefix = quoteMatch[1].trim();
    const passage = quoteMatch[2].trim();
    const suffix = quoteMatch[3].trim();

    // Avoid false positive on single short quoted words (like "Boolean", "Software") unless length >= 20 or instruction exists
    const hasInstructionWord = prefix && (prefix.includes("อ่าน") || prefix.includes("พิจารณา") || /read|consider/i.test(prefix));
    if (passage.length >= 20 || hasInstructionWord) {
      let splitIdx = -1;
      for (const kw of questionKeywords) {
        const idx = suffix.lastIndexOf(kw);
        if (idx !== -1 && (splitIdx === -1 || idx > splitIdx)) {
          splitIdx = idx;
        }
      }

      if (splitIdx !== -1) {
        const passageSuffix = suffix.slice(0, splitIdx).trim();
        const questionText = suffix.slice(splitIdx).trim();
        const fullPassage = `${prefix ? prefix + "\n" : ""}"${passage}" ${passageSuffix}`.trim();

        return {
          instruction: hasInstructionWord ? prefix : null,
          passage: formatPassageText(fullPassage),
          question: questionText,
        };
      }

      if (passage.length >= 25 || suffix.length > 5) {
        return {
          instruction: hasInstructionWord ? prefix : null,
          passage: formatPassageText(`"${passage}"`),
          question: suffix || cleanText,
        };
      }
    }
  }

  // 4. Multiline paragraph without explicit quotes where last line is a question (e.g. English dialogues or multiline passages)
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    const lastLine = lines[lines.length - 1];
    const isLastQuestion = questionKeywords.some((kw) => lastLine.toLowerCase().includes(kw.toLowerCase())) || lastLine.endsWith("?");

    if (isLastQuestion) {
      const passageLines = lines.slice(0, lines.length - 1).join("\n");
      const isInst = lines[0].includes("อ่าน") || lines[0].includes("พิจารณา") || /read|consider/i.test(lines[0]);
      return {
        instruction: isInst ? lines[0] : null,
        passage: formatPassageText(isInst ? lines.slice(1, lines.length - 1).join("\n") : passageLines),
        question: lastLine,
      };
    }
  }

  return { instruction: null, passage: null, question: cleanText };
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber = 1,
  totalQuestions = 1,
  chapter,
  category,
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
        const parsed = parseQuestionContent(questionText, category);
        if (parsed.passage) {
          return (
            <div className="space-y-3 mb-6">
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
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-relaxed pt-1">
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
