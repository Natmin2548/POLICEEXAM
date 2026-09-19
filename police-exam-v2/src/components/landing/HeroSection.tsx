"use client";

import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface HeroSectionProps {
  onOpenLogin: () => void;
  stats?: {
    users?: string;
    exams?: string;
    passRate?: string;
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenLogin,
  stats = {
    users: "843+",
    exams: "3,800+",
    passRate: "90%",
  },
}) => {
  return (
    <section className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-white via-white to-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-start sm:items-center sm:text-center">
        
        {/* Gemini AI Sparkle Badge */}
        <div className="inline-flex items-center gap-2 bg-police-50 text-police-800 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border border-police-800/15 mb-6 shadow-xs animate-pulse">
          <Sparkles className="w-4 h-4 text-police-800 shrink-0" />
          <span>เว็ปทำข้อสอบนายสิบตำรวจฟรี</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.15] mb-4">
          เตรียมพร้อม<br className="sm:hidden" />{" "}
          <span className="text-police-800">สู่เครื่องแบบ</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mb-8">
          แพลตฟอร์มเตรียมสอบนายสิบตำรวจที่ครบวงจร ใช้งานฟรี ตรวจคำตอบและวิเคราะห์ผลแบบเรียลไทม์
        </p>

        {/* CTA Button */}
        <div className="w-full sm:w-auto mb-10 sm:mb-14">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-police-800 hover:bg-police-700 active:scale-95 text-white text-sm sm:text-base font-bold px-8 py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-police-800/25 transition-all cursor-pointer group touch-manipulation"
          >
            <span>เข้าสู่ระบบด้วย Google</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 shrink-0" />
          </button>
        </div>

        {/* Stats Card Container */}
        <div className="w-full max-w-2xl bg-white sm:bg-white/80 sm:backdrop-blur-xs border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs sm:shadow-md">
          <div className="flex items-center justify-between">
            {/* Item 1: Users */}
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-police-800 leading-tight">
                {stats.users}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                ผู้ใช้งาน
              </span>
            </div>

            <div className="w-px h-8 sm:h-10 bg-slate-200" />

            {/* Item 2: Exams */}
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-police-800 leading-tight">
                {stats.exams}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                ข้อสอบ
              </span>
            </div>

            <div className="w-px h-8 sm:h-10 bg-slate-200" />

            {/* Item 3: Pass Rate */}
            <div className="flex-1 flex flex-col items-center text-center">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-police-800 leading-tight">
                {stats.passRate}
              </span>
              <span className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                สอบผ่าน
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
