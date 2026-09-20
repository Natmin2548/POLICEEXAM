"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Brain,
  Laptop,
  Scale,
  Globe,
  FileText,
  ClipboardList,
  BookOpen,
  Shield,
  Search,
  BookCheck,
  Layers,
  ArrowRight,
} from "lucide-react";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

interface ChapterItem {
  num: string;
  name: string;
  totalQuestions: number;
  setIds: number[];
}

interface CategoryData {
  categoryKey: string;
  displayName: string;
  iconType: string;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  totalQuestions: number;
  chapterCount: number;
  chapters: ChapterItem[];
}

function ArchiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategoryKey = searchParams.get("subject");

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chapterSearchQuery, setChapterSearchQuery] = useState("");

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch("/api/exam/chapters");
        if (res.ok) {
          const data = await res.json();
          if (data.categories) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.error("Failed to load chapters:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  const activeCategory = categories.find(
    (c) =>
      c.categoryKey === selectedCategoryKey ||
      c.displayName === selectedCategoryKey
  );

  const totalChaptersCount = categories.reduce(
    (acc, c) => acc + c.chapterCount,
    0
  );
  const totalQuestionsSum = categories.reduce(
    (acc, c) => acc + c.totalQuestions,
    0
  );

  // Helper to render subject icon
  const renderIcon = (type: string, color: string) => {
    switch (type) {
      case "text":
        return (
          <span className={`text-xs font-black ${color} tracking-wider`}>
            TH
          </span>
        );
      case "text_en":
        return (
          <span className={`text-xs font-black ${color} tracking-wider`}>
            EN
          </span>
        );
      case "brain":
        return <Brain className={`w-5 h-5 ${color}`} />;
      case "laptop":
        return <Laptop className={`w-5 h-5 ${color}`} />;
      case "scale":
        return <Scale className={`w-5 h-5 ${color}`} />;
      case "globe":
        return <Globe className={`w-5 h-5 ${color}`} />;
      case "file":
        return <FileText className={`w-5 h-5 ${color}`} />;
      case "clipboard":
        return <ClipboardList className={`w-5 h-5 ${color}`} />;
      default:
        return <BookOpen className={`w-5 h-5 ${color}`} />;
    }
  };

  // Helper to render icon background
  const getIconBg = (type: string) => {
    switch (type) {
      case "text":
        return "bg-red-50";
      case "brain":
        return "bg-purple-50";
      case "laptop":
        return "bg-blue-50";
      case "scale":
        return "bg-amber-50";
      case "globe":
        return "bg-emerald-50";
      case "file":
        return "bg-orange-50";
      case "clipboard":
        return "bg-pink-50";
      case "text_en":
        return "bg-cyan-50";
      default:
        return "bg-slate-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
        <p className="text-sm font-black text-slate-800">
          กำลังโหลดคลังข้อสอบรายบท...
        </p>
      </div>
    );
  }

  // Filtered lists
  const filteredCategories = categories.filter((cat) =>
    cat.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const filteredChapters = activeCategory
    ? activeCategory.chapters.filter((ch) =>
        ch.name.toLowerCase().includes(chapterSearchQuery.trim().toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-900 flex flex-col">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#FBFBFB]/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#BD1B0B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
              POLICE<span className="text-[#BD1B0B]">EXAM</span>
            </span>
          </Link>

          {/* Desktop Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500">
            <Link
              href="/home"
              className="hover:text-[#BD1B0B] transition-colors"
            >
              หน้าหลัก
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link
              href="/archive"
              className={`transition-colors ${
                activeCategory
                  ? "hover:text-[#BD1B0B]"
                  : "text-slate-900 font-black"
              }`}
            >
              คลังข้อสอบรายบท
            </Link>
            {activeCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-[#BD1B0B] font-black">
                  {activeCategory.displayName}
                </span>
              </>
            )}
          </div>

          {/* Back to Home Button */}
          <Link
            href="/home"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:border-red-200 hover:text-[#BD1B0B] text-slate-700 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* SCREEN 4: CHAPTERS LIST FOR SELECTED SUBJECT */}
        {activeCategory ? (
          <div className="space-y-6">
            {/* Subject Hero Header */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => router.push("/archive")}
                    className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    title="กลับไปเลือกวิชา"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div
                    className={`w-12 h-12 rounded-2xl ${getIconBg(
                      activeCategory.iconType
                    )} flex items-center justify-center shrink-0 border border-slate-100 shadow-2xs`}
                  >
                    {renderIcon(
                      activeCategory.iconType,
                      activeCategory.iconColor
                    )}
                  </div>

                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activeCategory.displayName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{activeCategory.chapterCount} บทเรียน</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#BD1B0B]">
                        <BookCheck className="w-3.5 h-3.5 text-[#BD1B0B]" />
                        <span>{activeCategory.totalQuestions} ข้อในคลัง</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Chapter Search Filter (Right aligned on desktop) */}
                {activeCategory.chapters.length > 5 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อบท..."
                      value={chapterSearchQuery}
                      onChange={(e) => setChapterSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Chapters View: Clean card list */}
            <div className="sm:hidden bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredChapters.map((ch, idx) => (
                <Link
                  key={idx}
                  href={`/exam/session?mode=chapter&setIds=${ch.setIds.join(
                    ","
                  )}&title=${encodeURIComponent(
                    ch.name
                  )}&category=${encodeURIComponent(
                    activeCategory.categoryKey
                  )}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 text-base font-black text-[#BD1B0B] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 truncate">
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#BD1B0B] transition-colors truncate">
                        {ch.name}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {ch.totalQuestions} ข้อ
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 ml-2" />
                </Link>
              ))}
            </div>

            {/* Desktop Chapters View: 2 or 3 Columns Card Grid */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredChapters.map((ch, idx) => (
                <Link
                  key={idx}
                  href={`/exam/session?mode=chapter&setIds=${ch.setIds.join(
                    ","
                  )}&title=${encodeURIComponent(
                    ch.name
                  )}&category=${encodeURIComponent(
                    activeCategory.categoryKey
                  )}`}
                  className="bg-white border border-slate-200/80 hover:border-red-300 hover:shadow-md hover:-translate-y-0.5 rounded-2xl p-4 transition-all group cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-red-50 text-[#BD1B0B] group-hover:bg-[#BD1B0B] group-hover:text-white flex items-center justify-center font-black text-xs shrink-0 transition-colors">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 truncate">
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-[#BD1B0B] transition-colors truncate">
                        {ch.name}
                      </h2>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {ch.totalQuestions} ข้อ
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 group-hover:bg-red-50 flex items-center justify-center shrink-0 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#BD1B0B] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push("/archive")}
                className="inline-flex items-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปเลือกวิชาอื่น</span>
              </button>
            </div>
          </div>
        ) : (
          /* SCREEN 3: SUBJECTS SELECTION */
          <div className="space-y-6">
            {/* Header with Title, Stats & Search */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-slate-200/60">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-xs font-bold text-[#BD1B0B] mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>
                    8 หมวดวิชา • {totalChaptersCount} บทเรียน •{" "}
                    {totalQuestionsSum.toLocaleString()} ข้อ
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  คลังข้อสอบรายบท
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  เลือกวิชาที่ต้องการฝึกฝนเพื่อทำข้อสอบแบบแยกรายหัวข้อ
                </p>
              </div>

              {/* Compact Search Bar */}
              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาวิชา..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* Mobile View (< sm): EXACT vertical stack of horizontal pills matching user's screenshot */}
            <div className="space-y-3 sm:hidden">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.categoryKey}
                  href={`/archive?subject=${encodeURIComponent(
                    cat.categoryKey
                  )}`}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl ${getIconBg(
                        cat.iconType
                      )} flex items-center justify-center shrink-0 border border-slate-100`}
                    >
                      {renderIcon(cat.iconType, cat.iconColor)}
                    </div>
                    <div className="truncate">
                      <h2 className="text-sm font-black text-slate-900 truncate">
                        {cat.displayName}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {cat.totalQuestions} ข้อในคลัง
                      </p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black ${cat.badgeBg} ${cat.badgeText} flex items-center gap-1 shrink-0`}
                  >
                    <span>{cat.chapterCount} บท</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}

              {/* Mobile Back Button */}
              <div className="pt-2">
                <Link
                  href="/home"
                  className="w-full py-3.5 px-4 bg-white border border-[#BD1B0B] text-[#BD1B0B] hover:bg-red-50 text-sm font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>กลับหน้าหลัก</span>
                </Link>
              </div>
            </div>

            {/* Desktop & Tablet View (>= sm): Symmetrical 4-Column Card Grid (2 Rows of 4 Cards) */}
            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredCategories.map((cat) => (
                <Link
                  key={cat.categoryKey}
                  href={`/archive?subject=${encodeURIComponent(
                    cat.categoryKey
                  )}`}
                  className="bg-white border border-slate-200/80 hover:border-red-300 hover:shadow-lg hover:-translate-y-1 rounded-3xl p-5 transition-all group flex flex-col justify-between cursor-pointer min-h-[170px]"
                >
                  {/* Top Row: Icon + Pastel Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl ${getIconBg(
                        cat.iconType
                      )} flex items-center justify-center shrink-0 border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform`}
                    >
                      {renderIcon(cat.iconType, cat.iconColor)}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black ${cat.badgeBg} ${cat.badgeText} flex items-center gap-1 border border-slate-100/80`}
                    >
                      <span>{cat.chapterCount} บท</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  {/* Bottom Row: Title + Question Count + Hover Arrow */}
                  <div className="mt-4">
                    <h2 className="text-base font-black text-slate-900 group-hover:text-[#BD1B0B] transition-colors leading-snug">
                      {cat.displayName}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-1 flex items-center justify-between">
                      <span>{cat.totalQuestions} ข้อในคลัง</span>
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#BD1B0B] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>เลือก</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <MobileBottomNav />
    </div>
  );
}

export default function ArchivePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4">
          <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
          <p className="text-sm font-black text-slate-800">
            กำลังเตรียมคลังข้อสอบ...
          </p>
        </div>
      }
    >
      <ArchiveContent />
    </Suspense>
  );
}
