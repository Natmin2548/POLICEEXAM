"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  FileSpreadsheet,
  BookOpen,
  Timer,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ExamSelectionPage() {
  const options = [
    {
      id: "suppression",
      badge: "สายปราบปราม",
      badgeColor: "bg-red-50 text-[#BD1B0B] border-red-200",
      title: "Pretest สายปราบปราม",
      subtitle: "150 ข้อ • ครอบคลุม 6 หมวดวิชาหลัก",
      description:
        "จำลองสนามสอบเสมือนจริง อิงโครงสร้างข้อสอบ ล่าสุด จัดเต็ม 150 ข้อ จับเวลาจริง 3 ชั่วโมง",
      tags: ["จับเวลา 3 ชม.", "150 ข้อ", "เกณฑ์ผ่าน 60%"],
      icon: Shield,
      iconBg: "bg-red-50 text-[#BD1B0B]",
      href: "/exam/session?mode=pretest_suppression&title=Pretest%20สายปราบปราม%20150%20ข้อ",
      highlight: true,
    },
    {
      id: "admin",
      badge: "สายอำนวยการ",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      title: "Pretest สายอำนวยการ",
      subtitle: "150 ข้อ • คอม 40 | สารบรรณ+ลักษณะ54 30 | กฎหมาย 25 | ทั่วไป 20 | ไทย 20 | อังกฤษ 15",
      description:
        "ข้อสอบเสมือนจริงสายอำนวยการตามโครงสร้าง:ล่าสุด จัดเต็ม 150 ข้อ จับเวลาจริง 3 ชั่วโมง",
      tags: ["จับเวลา 3 ชม.", "150 ข้อ", "เกณฑ์ผ่าน 60%"],
      icon: FileSpreadsheet,
      iconBg: "bg-amber-50 text-amber-700",
      href: "/exam/session?mode=pretest_admin&title=Pretest%20สายอำนวยการ%20150%20ข้อ",
      highlight: false,
    },
    {
      id: "subject",
      badge: "ฝึกรายวิชา",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
      title: "ทำข้อสอบรายวิชา 30 ข้อ",
      subtitle: "สุ่มคละทุกบทในวิชา • เจาะลึกเฉพาะหมวด",
      description:
        "เลือกฝึกเฉพาะวิชาที่ต้องการปรับปรุง สุ่มข้อสอบ 30 ข้อจากคลัง พร้อมเฉลยละเอียดและวิเคราะห์ผลทันที",
      tags: ["ไม่จำกัดเวลา", "30 ข้อ / วิชา", "เฉลยละเอียด"],
      icon: BookOpen,
      iconBg: "bg-blue-50 text-blue-700",
      href: "/exam/category",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#BD1B0B] text-xs font-bold transition-colors mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>กลับหน้าหลัก</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Pretest & ทำข้อสอบ</span>
              <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#BD1B0B] border border-red-100">
                ระบบ CBT เสมือนจริง
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              เลือกสายงานที่ต้องการสอบ หรือเลือกทำข้อสอบย่อยแบบรายวิชา
            </p>
          </div>

          {/* Quick Notice Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">
              อัปเดตเกณฑ์คะแนนตามประกาศ
            </span>
          </div>
        </div>

        {/* Mobile View: Compact List (Matching mobile reference screenshot) */}
        <div className="block md:hidden space-y-3.5">
          {options.map((opt) => (
            <Link
              key={opt.id}
              href={opt.href}
              className={`block bg-white border rounded-3xl p-5 shadow-xs active:scale-[0.99] transition-all group ${opt.highlight
                ? "border-red-200/90 ring-1 ring-red-100"
                : "border-slate-200/80"
                }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${opt.badgeColor}`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <h2 className="text-base font-black text-slate-900 group-hover:text-[#BD1B0B] transition-colors truncate">
                    {opt.title}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                    {opt.subtitle}
                  </p>
                </div>

                <div className="w-11 h-11 rounded-full bg-[#BD1B0B] text-white flex items-center justify-center shadow-md shadow-red-950/20 group-hover:bg-[#A81507] transition-all shrink-0">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* PC / Tablet Desktop View: Modern 3-Column Card Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {options.map((opt) => {
            const IconComp = opt.icon;
            return (
              <div
                key={opt.id}
                className={`relative flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${opt.highlight
                  ? "border-red-200 shadow-md shadow-red-950/5 ring-1 ring-red-100/80"
                  : "border-slate-200/80 shadow-xs hover:border-slate-300"
                  }`}
              >
                {/* Top: Icon + Badge */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl ${opt.iconBg} flex items-center justify-center border border-slate-100 shadow-2xs`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border ${opt.badgeColor}`}
                    >
                      {opt.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-1">
                    {opt.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold mb-3">
                    {opt.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-5">
                    {opt.description}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {opt.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-50 text-slate-700 border border-slate-200/60"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <Link
                  href={opt.href}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${opt.highlight
                    ? "bg-[#BD1B0B] hover:bg-[#A81507] text-white shadow-lg shadow-red-950/20 active:scale-[0.99]"
                    : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-[0.99]"
                    }`}
                >
                  <span>เริ่มทำข้อสอบ</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
