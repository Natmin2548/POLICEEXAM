"use client";

import React, { useState } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface SubjectCategory {
  id: string;
  name: string;
  totalQuestions: number;
  chaptersCount: number;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  chapters: ChapterItem[];
}

interface ChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  questionCount: number;
  sets: ExamSetItem[];
}

interface ExamSetItem {
  id: string;
  setNumber: number;
  title: string;
  questionCount: number;
}

const BANK_DATA: SubjectCategory[] = [
  {
    id: "thai",
    name: "ภาษาไทย",
    totalQuestions: 366,
    chaptersCount: 10,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    icon: <span className="font-bold text-sm text-slate-800">TH</span>,
    chapters: [
      {
        id: "th-1",
        chapterNumber: 1,
        title: "วิเคราะห์บทความ",
        questionCount: 50,
        sets: [
          { id: "th-1-1", setNumber: 1, title: "บทที่ 1 วิเคราะห์บทความ (ชุดที่ 1)", questionCount: 30 },
          { id: "th-1-2", setNumber: 2, title: "บทที่ 1 วิเคราะห์บทความ (ชุดที่ 2)", questionCount: 20 },
        ],
      },
      {
        id: "th-2",
        chapterNumber: 2,
        title: "โวหารการเขียน",
        questionCount: 59,
        sets: [
          { id: "th-2-1", setNumber: 1, title: "บทที่ 2 โวหารการเขียน (ชุดที่ 1)", questionCount: 30 },
          { id: "th-2-2", setNumber: 2, title: "บทที่ 2 โวหารการเขียน (ชุดที่ 2)", questionCount: 29 },
        ],
      },
      {
        id: "th-3",
        chapterNumber: 3,
        title: "โวหารภาพพจน์",
        questionCount: 60,
        sets: [
          { id: "th-3-1", setNumber: 1, title: "บทที่ 3 โวหารภาพพจน์ (ชุดที่ 1)", questionCount: 30 },
          { id: "th-3-2", setNumber: 2, title: "บทที่ 3 โวหารภาพพจน์ (ชุดที่ 2)", questionCount: 30 },
        ],
      },
      {
        id: "th-4",
        chapterNumber: 4,
        title: "ระดับภาษา",
        questionCount: 30,
        sets: [{ id: "th-4-1", setNumber: 1, title: "บทที่ 4 ระดับภาษา (ชุดที่ 1)", questionCount: 30 }],
      },
      {
        id: "th-5",
        chapterNumber: 5,
        title: "การใช้คำตรงความหมาย",
        questionCount: 30,
        sets: [{ id: "th-5-1", setNumber: 1, title: "บทที่ 5 การใช้คำตรงความหมาย (ชุดที่ 1)", questionCount: 30 }],
      },
      {
        id: "th-6",
        chapterNumber: 6,
        title: "สำนวน สุภาษิต",
        questionCount: 30,
        sets: [{ id: "th-6-1", setNumber: 1, title: "บทที่ 6 สำนวน สุภาษิต (ชุดที่ 1)", questionCount: 30 }],
      },
      {
        id: "th-7",
        chapterNumber: 7,
        title: "อุดมคติ คำคม คำขวัญ คติพจน์",
        questionCount: 27,
        sets: [{ id: "th-7-1", setNumber: 1, title: "บทที่ 7 อุดมคติ คำคม คำขวัญ (ชุดที่ 1)", questionCount: 27 }],
      },
      {
        id: "th-8",
        chapterNumber: 8,
        title: "สะกดคำและคำทับศัพท์",
        questionCount: 30,
        sets: [{ id: "th-8-1", setNumber: 1, title: "บทที่ 8 สะกดคำและคำทับศัพท์ (ชุดที่ 1)", questionCount: 30 }],
      },
      {
        id: "th-9",
        chapterNumber: 9,
        title: "คำราชาศัพท์",
        questionCount: 23,
        sets: [{ id: "th-9-1", setNumber: 1, title: "บทที่ 9 คำราชาศัพท์ (ชุดที่ 1)", questionCount: 23 }],
      },
      {
        id: "th-10",
        chapterNumber: 10,
        title: "การใช้ภาษาไทยในชีวิตประจำวัน",
        questionCount: 17,
        sets: [{ id: "th-10-1", setNumber: 1, title: "บทที่ 10 การใช้ภาษาไทยในชีวิตประจำวัน", questionCount: 17 }],
      },
    ],
  },
  {
    id: "general",
    name: "ความสามารถทั่วไป",
    totalQuestions: 390,
    chaptersCount: 9,
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    icon: <span className="text-lg">🧠</span>,
    chapters: [
      {
        id: "gen-1",
        chapterNumber: 1,
        title: "อนุกรมตัวเลข",
        questionCount: 60,
        sets: [{ id: "gen-1-1", setNumber: 1, title: "บทที่ 1 อนุกรมตัวเลข (ชุดที่ 1)", questionCount: 30 }],
      },
      {
        id: "gen-2",
        chapterNumber: 2,
        title: "คณิตศาสตร์พื้นฐาน",
        questionCount: 50,
        sets: [{ id: "gen-2-1", setNumber: 1, title: "บทที่ 2 คณิตศาสตร์พื้นฐาน (ชุดที่ 1)", questionCount: 30 }],
      },
    ],
  },
  {
    id: "computer",
    name: "คอมพิวเตอร์",
    totalQuestions: 290,
    chaptersCount: 10,
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-700",
    icon: <span className="text-lg">💻</span>,
    chapters: [
      {
        id: "com-1",
        chapterNumber: 1,
        title: "ประวัติและความรู้พื้นฐานคอมพิวเตอร์",
        questionCount: 30,
        sets: [{ id: "com-1-1", setNumber: 1, title: "บทที่ 1 ความรู้พื้นฐานคอมพิวเตอร์", questionCount: 30 }],
      },
    ],
  },
  {
    id: "law",
    name: "กฎหมาย",
    totalQuestions: 374,
    chaptersCount: 22,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    icon: <span className="text-lg">⚖️</span>,
    chapters: [
      {
        id: "law-1",
        chapterNumber: 1,
        title: "พ.ร.บ.ตำรวจแห่งชาติ พ.ศ. 2565",
        questionCount: 40,
        sets: [{ id: "law-1-1", setNumber: 1, title: "บทที่ 1 พ.ร.บ.ตำรวจ 2565", questionCount: 30 }],
      },
    ],
  },
  {
    id: "social",
    name: "สังคม",
    totalQuestions: 149,
    chaptersCount: 5,
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    icon: <span className="text-lg">🌍</span>,
    chapters: [
      {
        id: "soc-1",
        chapterNumber: 1,
        title: "สังคม วัฒนธรรมและจริยธรรม",
        questionCount: 30,
        sets: [{ id: "soc-1-1", setNumber: 1, title: "บทที่ 1 สังคมและจริยธรรม", questionCount: 30 }],
      },
    ],
  },
  {
    id: "secretariat",
    name: "งานสารบรรณ",
    totalQuestions: 290,
    chaptersCount: 8,
    badgeBg: "bg-orange-50",
    badgeText: "text-orange-700",
    icon: <span className="text-lg">📄</span>,
    chapters: [
      {
        id: "sec-1",
        chapterNumber: 1,
        title: "ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ",
        questionCount: 30,
        sets: [{ id: "sec-1-1", setNumber: 1, title: "บทที่ 1 ระเบียบงานสารบรรณ", questionCount: 30 }],
      },
    ],
  },
  {
    id: "section54",
    name: "ลักษณะที่ 54",
    totalQuestions: 190,
    chaptersCount: 6,
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    icon: <span className="text-lg">📋</span>,
    chapters: [
      {
        id: "s54-1",
        chapterNumber: 1,
        title: "ระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะที่ ๕๔",
        questionCount: 30,
        sets: [{ id: "s54-1-1", setNumber: 1, title: "บทที่ 1 ลักษณะที่ ๕๔ งานสารบรรณ", questionCount: 30 }],
      },
    ],
  },
];

interface BankViewProps {
  onBackToHome: () => void;
  onStartSet: (setId: string, title: string) => void;
}

export const BankView: React.FC<BankViewProps> = ({ onBackToHome, onStartSet }) => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectCategory | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<ChapterItem | null>(null);

  // Level 3: Sets in Chapter (Screenshot 5)
  if (selectedSubject && selectedChapter) {
    return (
      <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setSelectedChapter(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {selectedChapter.title}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              วิชา{selectedSubject.name}
            </p>
          </div>
        </div>

        {/* Set list cards */}
        <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {selectedChapter.sets.map((setItem) => (
            <button
              type="button"
              key={setItem.id}
              onClick={() => onStartSet(setItem.id, setItem.title)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group touch-manipulation"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-police-800 w-5 text-center shrink-0">
                  {setItem.setNumber}
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-police-800 transition-colors">
                    {setItem.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {setItem.questionCount} ข้อ
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-police-800 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Level 2: Chapters in Subject (Screenshot 4)
  if (selectedSubject) {
    return (
      <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setSelectedSubject(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            {selectedSubject.name}
          </h1>
        </div>

        {/* Chapters List */}
        <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {selectedSubject.chapters.map((chapter) => (
            <button
              type="button"
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter)}
              className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group touch-manipulation"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-police-800 w-5 text-center shrink-0">
                  {chapter.chapterNumber}
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-police-800 transition-colors">
                    {chapter.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {chapter.questionCount} ข้อ
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-police-800 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Level 1: Main Categories List (Screenshot 2)
  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
      {/* Title */}
      <div className="pt-2">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          คลังข้อสอบรายบท
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          เลือกวิชา
        </p>
      </div>

      {/* Subject list */}
      <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-xs overflow-hidden">
        {BANK_DATA.map((sub) => (
          <button
            type="button"
            key={sub.id}
            onClick={() => setSelectedSubject(sub)}
            className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors cursor-pointer group touch-manipulation"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {sub.icon}
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-police-800 transition-colors">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {sub.totalQuestions} ข้อในคลัง
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${sub.badgeBg} ${sub.badgeText}`}
              >
                {sub.chaptersCount} บท
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-police-800 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToHome}
        className="w-full mt-2 py-3.5 rounded-2xl border-2 border-[#BD1B0B] text-[#BD1B0B] font-extrabold text-sm hover:bg-rose-50/80 active:scale-98 transition-all cursor-pointer touch-manipulation"
      >
        ← กลับหน้าหลัก
      </button>
    </div>
  );
};
