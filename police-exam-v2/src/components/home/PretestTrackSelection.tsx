"use client";

import React, { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface PretestTrackSelectionProps {
  onBack: () => void;
  onSelectTrack: (trackName: string, totalQuestions: number) => void;
}

const SUBJECT_30_LIST = [
  {
    id: "thai",
    name: "ภาษาไทย",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg">
        📕
      </span>
    ),
  },
  {
    id: "general",
    name: "ความสามารถทั่วไป",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-lg">
        🧮
      </span>
    ),
  },
  {
    id: "computer",
    name: "คอมพิวเตอร์และสารสนเทศ",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-lg">
        💻
      </span>
    ),
  },
  {
    id: "law",
    name: "กฎหมายที่ประชาชนควรรู้",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg">
        ⚖️
      </span>
    ),
  },
  {
    id: "social",
    name: "สังคมและวัฒนธรรม",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">
        🌍
      </span>
    ),
  },
  {
    id: "secretariat",
    name: "งานสารบรรณ (๒๕๒๖)",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-lg">
        📄
      </span>
    ),
  },
  {
    id: "section54",
    name: "ระเบียบตำรวจ ลักษณะที่ ๕๔",
    subtitle: "สุ่มคละทุกบทเรียน (30 ข้อ)",
    icon: (
      <span className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-lg">
        📋
      </span>
    ),
  },
];

export const PretestTrackSelection: React.FC<PretestTrackSelectionProps> = ({
  onBack,
  onSelectTrack,
}) => {
  const [subView, setSubView] = useState<"main" | "subject30">("main");

  // Sub-view: ทำข้อสอบรายวิชา 30 ข้อ (Screenshot 4)
  if (subView === "subject30") {
    return (
      <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setSubView("main")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              ทำข้อสอบรายวิชา 30 ข้อ
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              สุ่มคละทุกบทในวิชา รวม 30 ข้อ
            </p>
          </div>
        </div>

        {/* 7 Subject Cards */}
        <div className="flex flex-col gap-3">
          {SUBJECT_30_LIST.map((sub) => (
            <button
              type="button"
              key={sub.id}
              onClick={() => onSelectTrack(`ข้อสอบ 30 ข้อ: วิชา${sub.name}`, 30)}
              className="w-full text-left bg-white border border-slate-100 rounded-3xl p-4 sm:p-5 flex items-center justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group touch-manipulation"
            >
              <div className="flex items-center gap-3.5">
                {sub.icon}
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-police-800 transition-colors">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {sub.subtitle}
                  </p>
                </div>
              </div>

              {/* Red Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#B71C1C] transition-all shrink-0">
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Main Track Selection: Pretest 150 ข้อ (Screenshot 2)
  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer text-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Pretest 150 ข้อ
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            เลือกสายที่ต้องการสอบ
          </p>
        </div>
      </div>

      {/* 3 Main Track Cards */}
      <div className="flex flex-col gap-3.5 mt-1">
        {/* Card 1: สายปราบปราม */}
        <button
          type="button"
          onClick={() => onSelectTrack("สนามสอบจำลอง 150 ข้อ (สายปราบปราม)", 150)}
          className="w-full text-left bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group touch-manipulation"
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-police-800 transition-colors">
              สายปราบปราม
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              ข้อสอบเสมือนจริง 150 ข้อ • จับเวลา 3 ชั่วโมง
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#B71C1C] transition-all shrink-0">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </button>

        {/* Card 2: สายอำนวยการ */}
        <button
          type="button"
          onClick={() => onSelectTrack("สนามสอบจำลอง 150 ข้อ (สายอำนวยการ)", 150)}
          className="w-full text-left bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group touch-manipulation"
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-police-800 transition-colors">
              สายอำนวยการ
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              ข้อสอบเสมือนจริง 150 ข้อ • จับเวลา 3 ชั่วโมง
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#B71C1C] transition-all shrink-0">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </button>

        {/* Card 3: ทำข้อสอบรายวิชา 30 ข้อ */}
        <button
          type="button"
          onClick={() => setSubView("subject30")}
          className="w-full text-left bg-white border border-slate-100 rounded-3xl p-5 flex items-center justify-between shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group touch-manipulation"
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-police-800 transition-colors">
              ทำข้อสอบรายวิชา 30 ข้อ
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              เลือกฝึกเจาะเฉพาะวิชา สุ่มคละทุกบท 30 ข้อ
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#B71C1C] transition-all shrink-0">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </button>
      </div>
    </div>
  );
};
