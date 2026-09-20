"use client";

import React from "react";
import { Sparkles, ArrowRight, Shield } from "lucide-react";

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
    <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 md:py-24 bg-white">
      {/* Dynamic Background Glow Effect (Prevents Bland Look on Mobile) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(189,27,11,0.12)_0%,rgba(189,27,11,0.03)_50%,transparent_80%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-100/60 blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center text-center">
        
        {/* Floating Shield Emblem on Mobile */}
        <div className="mb-4 sm:mb-6 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#BD1B0B] to-rose-600 text-white flex items-center justify-center shadow-xl shadow-red-700/25 ring-4 ring-red-50/80 transform hover:scale-105 transition-transform">
          <Shield className="w-7 h-7 sm:w-8 sm:h-8 fill-white/20" />
        </div>

        {/* Gemini AI Sparkle Badge */}
        <div className="inline-flex items-center gap-2 bg-red-50 text-[#BD1B0B] px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border border-red-200/80 mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#BD1B0B] shrink-0 animate-spin-slow" />
          <span>เว็ปทำข้อสอบนายสิบตำรวจฟรี ปี 2569</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.2] sm:leading-[1.15] mb-4">
          เตรียมพร้อม <br />
          <span className="bg-gradient-to-r from-[#BD1B0B] via-red-600 to-rose-500 bg-clip-text text-transparent">
            สู่เครื่องแบบตำรวจ
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-xl mb-8 px-2">
          แพลตฟอร์มเตรียมสอบนายสิบตำรวจที่ครบวงจรที่สุด ตะลุยโจทย์ย้อนหลัง ตรวจคำตอบ จับเวลาจริง และวิเคราะห์ผลแบบเรียลไทม์
        </p>

        {/* CTA Google Button */}
        <div className="w-full sm:w-auto mb-10 sm:mb-12">
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#BD1B0B] to-[#9E1307] hover:from-[#A81507] hover:to-[#871005] active:scale-98 text-white text-base font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-red-700/30 transition-all cursor-pointer group touch-manipulation ring-2 ring-red-400/20"
          >
            {/* Google Icon Inside Button */}
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span>เข้าสู่ระบบด้วย Google</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 shrink-0" />
          </button>
        </div>

        {/* Stats Card Container (Redesigned with Warmth & Vibrancy on Mobile) */}
        <div className="w-full max-w-2xl bg-gradient-to-b from-white to-red-50/40 border-2 border-red-100 rounded-3xl p-4 sm:p-6 shadow-xl shadow-red-950/5">
          <div className="grid grid-cols-3 divide-x divide-red-100">
            {/* Item 1: Users */}
            <div className="flex flex-col items-center text-center px-1">
              <span className="text-2xl sm:text-4xl font-black text-[#BD1B0B] leading-tight tracking-tight">
                {stats.users}
              </span>
              <span className="text-[11px] sm:text-sm text-slate-600 font-bold mt-1">
                ผู้ใช้งาน
              </span>
            </div>

            {/* Item 2: Exams */}
            <div className="flex flex-col items-center text-center px-1">
              <span className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {stats.exams}
              </span>
              <span className="text-[11px] sm:text-sm text-slate-600 font-bold mt-1">
                ข้อสอบจริง
              </span>
            </div>

            {/* Item 3: Pass Rate */}
            <div className="flex flex-col items-center text-center px-1">
              <span className="text-2xl sm:text-4xl font-black text-emerald-600 leading-tight tracking-tight">
                {stats.passRate}
              </span>
              <span className="text-[11px] sm:text-sm text-slate-600 font-bold mt-1">
                สอบผ่าน
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
