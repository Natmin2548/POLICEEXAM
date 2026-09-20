"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Brain,
  Laptop,
  Scale,
  Globe,
  FileText,
  ClipboardList,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function ExamCategoryPage() {
  const categories = [
    {
      id: "thai",
      title: "ภาษาไทย",
      categoryKey: "ภาษาไทย",
      icon: BookOpen,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      desc: "การอ่านจับใจความ สำนวน คำราชาศัพท์ และหลักภาษา",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "general",
      title: "ความสามารถทั่วไป",
      categoryKey: "ทั่วไป",
      icon: Brain,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      desc: "คณิตศาสตร์ทั่วไป อนุกรม อุปมาอุปไมย และตรรกศาสตร์",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "computer",
      title: "คอมพิวเตอร์และสารสนเทศ",
      categoryKey: "คอม",
      icon: Laptop,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      desc: "ระบบเครือข่าย ซอฟต์แวร์สำนักงาน และเทคโนโลยีสมัยใหม่",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "law",
      title: "กฎหมายที่ประชาชนควรรู้",
      categoryKey: "กฏหมาย",
      icon: Scale,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      desc: "ประมวลกฎหมายอาญา วิธีพิจารณาความอาญา และสิทธิพื้นฐาน",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "social",
      title: "สังคมและวัฒนธรรม",
      categoryKey: "สังคม",
      icon: Globe,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      desc: "ประวัติศาสตร์ หน้าที่พลเมือง อาเซียน และความรู้รอบตัว",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "saraban26",
      title: "งานสารบรรณ (๒๕๒๖)",
      categoryKey: "งานสารบรรณ_๒๕๒๖",
      icon: FileText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      desc: "ระเบียบสำนักนายกรัฐมนตรีว่าด้วยงานสารบรรณ พ.ศ. ๒๕๒๖",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "saraban54",
      title: "ระเบียบตำรวจ ลักษณะที่ ๕๔",
      categoryKey: "สารบรรณตำรวจ_๕๔",
      icon: ClipboardList,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      desc: "ระเบียบการตำรวจไม่เกี่ยวกับคดี ลักษณะ ๕๔ งานสารบรรณ",
      countLabel: "30 ข้อ / ชุด",
    },
    {
      id: "english",
      title: "ภาษาอังกฤษ",
      categoryKey: "ภาษาอังกฤษ",
      icon: BookOpen,
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      desc: "Reading comprehension, Vocabulary, Grammar & Conversation",
      countLabel: "30 ข้อ / ชุด",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <Link
              href="/exam"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#BD1B0B] text-xs font-bold transition-colors mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>ย้อนกลับไปเลือกโหมด</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>ทำข้อสอบรายวิชา 30 ข้อ</span>
              <span className="hidden sm:inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-[#BD1B0B] border border-red-100">
                8 หมวดวิชา
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              สุ่มคละข้อสอบทุกบทเรียนในวิชานั้น รวม 30 ข้อต่อชุด พร้อมเฉลยละเอียด
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-2xs self-start sm:self-auto">
            <Layers className="w-4 h-4 text-[#BD1B0B]" />
            <span className="text-xs font-bold text-slate-700">
              คัดเลือกจากคลังข้อสอบจริง
            </span>
          </div>
        </div>

        {/* Mobile View: Clean List (Identical to screenshot reference) */}
        <div className="block md:hidden space-y-3">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/exam/session?mode=subject_single&category=${encodeURIComponent(
                  cat.categoryKey
                )}&title=${encodeURIComponent(cat.title)}`}
                className="block bg-white border border-slate-200/80 hover:border-red-200 rounded-3xl p-4 sm:p-5 shadow-xs active:scale-[0.99] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Icon & Title */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center shrink-0 border border-slate-100 shadow-2xs`}
                    >
                      <IconComponent className={`w-6 h-6 ${cat.iconColor}`} />
                    </div>
                    <div className="truncate">
                      <h2 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#BD1B0B] transition-colors truncate">
                        {cat.title}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        สุ่มคละทุกบทเรียน (30 ข้อ)
                      </p>
                    </div>
                  </div>

                  {/* Right: Circular Red Arrow Button */}
                  <div className="w-10 h-10 rounded-full bg-[#BD1B0B] text-white flex items-center justify-center shadow-md shadow-red-950/20 group-hover:scale-105 group-hover:bg-[#A81507] transition-all shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* PC Desktop View: Modern Multi-Column Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.id}
                href={`/exam/session?mode=subject_single&category=${encodeURIComponent(
                  cat.categoryKey
                )}&title=${encodeURIComponent(cat.title)}`}
                className="flex flex-col justify-between bg-white border border-slate-200/80 hover:border-red-300 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group cursor-pointer"
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl ${cat.iconBg} flex items-center justify-center border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      <IconComponent className={`w-6 h-6 ${cat.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                      {cat.countLabel}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-base font-black text-slate-900 group-hover:text-[#BD1B0B] transition-colors mb-1.5 leading-snug">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-2 mb-4">
                    {cat.desc}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-[#BD1B0B] transition-colors">
                  <span>เริ่มทำข้อสอบ</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#BD1B0B] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
