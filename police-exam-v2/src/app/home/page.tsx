"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  Shield,
  Laptop,
  Scale,
  Globe,
  Brain,
  BookOpen,
  Trophy,
  Home,
  BookMarked,
  Image as ImageIcon,
  LogOut,
  Calendar,
  Sparkles,
  Flame,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import SupportModal from "@/components/SupportModal";

interface Recommendation {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  actionUrl: string;
}

interface UserStats {
  userName?: string | null;
  role?: string;
  completedSets: number;
  averageScore: number;
  maxScore: number;
  incorrectCount?: number;
  recommendation?: Recommendation;
  subjects: {
    [key: string]: {
      count: number;
      score: number;
    };
  };
}

const defaultStats: UserStats = {
  completedSets: 0,
  averageScore: 0,
  maxScore: 0,
  incorrectCount: 0,
  recommendation: {
    badge: "คำแนะนำวันนี้",
    title: "ฝึกทำข้อสอบสายอำนวยการ",
    description: "ตะลุยโจทย์ย้อนหลังชุดข้อสอบจริง 150 ข้อ จับเวลาจริงเพื่อฝึกสปีดความเร็ว",
    buttonText: "เริ่มทำข้อสอบทันที",
    actionUrl: "/exam",
  },
  subjects: {
    thai: { count: 0, score: 0 },
    math: { count: 0, score: 0 },
    com: { count: 0, score: 0 },
    law: { count: 0, score: 0 },
    social: { count: 0, score: 0 },
    eng: { count: 0, score: 0 },
  },
};

const subjectsMetadata = [
  {
    id: "thai",
    name: "ภาษาไทย",
    iconType: "text" as const,
    iconText: "TH",
    iconColor: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "math",
    name: "ความสามารถทั่วไป",
    iconType: "brain" as const,
    iconColor: "text-pink-500",
    bgColor: "bg-pink-50",
  },
  {
    id: "com",
    name: "คอมพิวเตอร์",
    iconType: "laptop" as const,
    iconColor: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    id: "law",
    name: "กฎหมาย",
    iconType: "scale" as const,
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "social",
    name: "สังคม",
    iconType: "globe" as const,
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    id: "eng",
    name: "ภาษาอังกฤษ",
    iconType: "text" as const,
    iconText: "EN",
    iconColor: "text-rose-600",
    bgColor: "bg-rose-50",
  },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [greeting, setGreeting] = useState("สวัสดีตอนบ่าย");
  const [activeTab, setActiveTab] = useState<"home" | "archive" | "rank">("home");
  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  useEffect(() => {
    // Load cached stats if available
    try {
      const saved = localStorage.getItem("police_exam_user_stats");
      if (saved) {
        const parsed = JSON.parse(saved);
        setStats((prev) => ({
          ...prev,
          ...parsed,
          recommendation: parsed.recommendation || prev.recommendation,
        }));
      }
    } catch {
      // default clean stats
    }

    // Determine dynamic Thai greeting based on current local hour
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("สวัสดีตอนเช้า");
    else if (hour >= 12 && hour < 17) setGreeting("สวัสดีตอนบ่าย");
    else if (hour >= 17 && hour < 21) setGreeting("สวัสดีตอนเย็น");
    else setGreeting("สวัสดีตอนค่ำ");

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          setIsAuthChecking(false);
          return;
        }

        // Check if URL has active tokens or code being parsed
        const hasTokens =
          typeof window !== "undefined" &&
          (window.location.hash.includes("access_token") ||
            window.location.search.includes("code"));

        if (!hasTokens) {
          window.location.replace("/");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        window.location.replace("/");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthChecking(false);
      } else {
        const hasTokens =
          typeof window !== "undefined" &&
          (window.location.hash.includes("access_token") ||
            window.location.search.includes("code"));
        if (!hasTokens) {
          window.location.replace("/");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Derive active recommendation dynamically (ensures correct display even before fetch completes or if cached from older version)
  const activeRecommendation = React.useMemo(() => {
    if (stats.recommendation && stats.recommendation.title !== "ฝึกทำข้อสอบสายอำนวยการ") {
      return stats.recommendation;
    }

    // If user has completed exams and has subjects with scores, identify weakest subject
    if (stats.completedSets > 0 && stats.subjects) {
      const subjectsList = [
        { id: "thai", name: "ภาษาไทย", score: stats.subjects.thai?.score || 0 },
        { id: "math", name: "ความสามารถทั่วไป", score: stats.subjects.math?.score || 0 },
        { id: "com", name: "คอมพิวเตอร์", score: stats.subjects.com?.score || 0 },
        { id: "law", name: "กฎหมาย", score: stats.subjects.law?.score || 0 },
        { id: "social", name: "สังคม", score: stats.subjects.social?.score || 0 },
        { id: "eng", name: "ภาษาอังกฤษ", score: stats.subjects.eng?.score || 0 },
      ];
      const lowest = [...subjectsList].sort((a, b) => a.score - b.score)[0];
      if (lowest && lowest.score < 60) {
        const catMap: Record<string, string> = {
          thai: "ภาษาไทย",
          math: "ทั่วไป",
          com: "คอม",
          law: "กฏหมาย",
          social: "สังคม",
          eng: "ภาษาอังกฤษ",
        };
        return {
          badge: "เน้นแก้จุดอ่อนด่วน",
          title: `เจาะลึกวิชา${lowest.name}`,
          description: `คะแนนวิชานี้อยู่ที่ ${lowest.score}% ยังไม่ผ่านเกณฑ์ 60% แนะนำให้เน้นตะลุยโจทย์หมวดนี้เพื่อไม่ให้ตกเกณฑ์`,
          buttonText: `เริ่มฝึกวิชา${lowest.name}`,
          actionUrl: `/exam/session?mode=subject_single&category=${encodeURIComponent(
            catMap[lowest.id] || "ภาษาไทย"
          )}&title=${encodeURIComponent("เจาะลึกวิชา" + lowest.name)}`,
        };
      }
    }

    return stats.recommendation || defaultStats.recommendation!;
  }, [stats]);

  // Fetch real database statistics for the logged in user
  useEffect(() => {
    if (!user?.email) return;

    const fetchUserStats = async () => {
      try {
        const res = await fetch(
          `/api/user/stats?email=${encodeURIComponent(user.email!)}&_t=${Date.now()}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.subjects) {
            setStats(data);
            localStorage.setItem("police_exam_user_stats", JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error("Failed to load user stats from DB:", err);
      }
    };

    fetchUserStats();
  }, [user?.email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace("/");
  };

  // Google User Data
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    "";

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    stats.userName ||
    user?.user_metadata?.preferred_username ||
    (user?.email ? user.email.split("@")[0] : "") ||
    "ผู้เข้าสอบ";

  // Days until exam date (29 Nov 2026)
  const examDaysLeft = (() => {
    const examDate = new Date(2026, 10, 29);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-red-200 border-t-[#BD1B0B] animate-spin" />
        <p className="text-xs text-slate-500 font-bold">กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-900 pb-28 lg:pb-12 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Top Header (Responsive for both Mobile & Desktop) */}
      <header className="sticky top-0 z-30 bg-[#FBFBFB]/90 backdrop-blur-md border-b border-slate-100/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#BD1B0B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              POLICE<span className="text-[#BD1B0B]">EXAM</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/50">
            <Link
              href="/home"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-[#BD1B0B] shadow-xs"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/archive"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
            >
              คลังข้อสอบ
            </Link>
            <Link
              href="/rank"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
            >
              จัดอันดับ
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#BD1B0B] hover:border-red-200 transition-colors shadow-2xs cursor-pointer"
              aria-label="แจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  {greeting}
                </span>
                <span className="text-sm font-black text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-[240px]">
                  {displayName}
                </span>
              </div>

              {/* Avatar Button & Popup Panel (Matching Screenshot) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  title="โปรไฟล์และเมนูจัดการ"
                  className="w-10 h-10 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-200 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0288D1] flex items-center justify-center text-white text-sm font-bold">
                      {(displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Popup Menu */}
                {showProfileMenu && (
                  <>
                    {/* Invisible Backdrop to close on click outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-64 sm:w-72 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100/90 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header (Name in bold, email in gray) */}
                      <div className="mb-3 px-1">
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {displayName}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                          {user?.email || ""}
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-slate-100 my-2.5" />

                      {/* Options List */}
                      <div className="space-y-1">
                        {/* 1. การแจ้งเตือน */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left"
                        >
                          <Bell className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>การแจ้งเตือน</span>
                        </button>

                        {/* 2. จัดการระบบ (Admin Panel) - ONLY visible if ADMIN */}
                        {stats.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-50/60 text-[#BD1B0B] text-xs sm:text-sm font-black transition-colors cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-[#BD1B0B] shrink-0" />
                            <span>จัดการระบบ (Admin Panel)</span>
                          </Link>
                        )}

                        {/* 3. ออกจากระบบ */}
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        {/* Responsive Grid: Single column on Mobile, 2-Column Dashboard on Desktop */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
          
          {/* Left Column (8 Columns on PC) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Banner: Pretest 150 ข้อ (Matching Screenshot 1) */}
            <Link
              href="/exam"
              className="relative overflow-hidden rounded-3xl bg-[#BD1B0B] text-white p-6 sm:p-7 shadow-lg shadow-red-950/15 flex items-center justify-between cursor-pointer hover:bg-[#A81507] hover:shadow-xl transition-all group block"
            >
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Pretest 150 ข้อ
                </h1>
                <p className="text-xs sm:text-sm text-white/80 font-medium">
                  สายปราบปราม - สายอำนวยการ
                </p>
              </div>

              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#BD1B0B] transition-colors shrink-0">
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </Link>

            {/* 4 Feature Cards (Simple & Clean 2x2 on Mobile, 4 columns on PC) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: ร้องขอ/แจ้งเรื่อง */}
              <button
                type="button"
                onClick={() => setShowSupportModal(true)}
                className="bg-white border border-slate-100 hover:border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer text-left w-full"
              >
                <h3 className="text-base font-black text-[#BD1B0B] mb-0.5">
                  ร้องขอ
                </h3>
                <p className="text-xs text-slate-400 font-medium">แจ้งเรื่องแอดมิน</p>
              </button>

              {/* Card 2: คลังรายบท */}
              <Link
                href="/archive"
                className="bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer block"
              >
                <h3 className="text-base font-black text-slate-900 mb-0.5">
                  คลังรายบท
                </h3>
                <p className="text-xs text-slate-400 font-medium">เจาะทีละบท</p>
              </Link>

              {/* Card 3: อันดับ */}
              <Link
                href="/rank"
                className="bg-white border border-slate-100 hover:border-red-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer block"
              >
                <h3 className="text-base font-black text-[#BD1B0B] mb-0.5">
                  อันดับ
                </h3>
                <p className="text-xs text-slate-400 font-medium">ผู้สอบ 150 ข้อ</p>
              </Link>

              {/* Card 4: คลังคำศัพท์ */}
              <div className="bg-white border border-slate-100 hover:border-slate-300 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer">
                <h3 className="text-base font-black text-slate-900 mb-0.5">
                  คลังคำศัพท์
                </h3>
                <p className="text-xs text-slate-400 font-medium">เลือกด่วน !</p>
              </div>
            </div>

            {/* Section: สถิติ (Shown on Mobile only - clean & simple) */}
            <div className="lg:hidden">
              <h2 className="text-base font-black text-slate-900 mb-3 px-1 sm:px-2">สถิติ</h2>
              <div className="grid grid-cols-3 gap-3">
                {/* Stat 1: ทำแล้ว */}
                <div className="bg-white border border-slate-200/80 rounded-2xl h-24 px-2 text-center shadow-xs flex flex-col items-center justify-center">
                  <div className="flex items-baseline justify-center gap-1 leading-none mb-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {stats.completedSets}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-600">
                      ชุด
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">ทำแล้ว</span>
                </div>

                {/* Stat 2: เฉลี่ย */}
                <div className="bg-[#FFF5F5] border border-red-200/70 rounded-2xl h-24 px-2 text-center shadow-xs flex flex-col items-center justify-center">
                  <div className="flex items-baseline justify-center gap-0.5 leading-none mb-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#BD1B0B]">
                      {stats.averageScore}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#BD1B0B]">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">เฉลี่ย</span>
                </div>

                {/* Stat 3: สูงสุด */}
                <div className="bg-white border border-slate-200/80 rounded-2xl h-24 px-2 text-center shadow-xs flex flex-col items-center justify-center">
                  <div className="flex items-baseline justify-center gap-0.5 leading-none mb-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#BD1B0B]">
                      {stats.maxScore}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#BD1B0B]">
                      %
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">สูงสุด</span>
                </div>
              </div>
            </div>

            {/* Mobile Smart Recommendation Card */}
            <div className="block lg:hidden relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/60 border-2 border-red-500/30 rounded-3xl p-5 shadow-lg shadow-red-500/5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100/90 text-[#BD1B0B] border border-red-200/80 shadow-2xs mb-2.5">
                <Flame className="w-3.5 h-3.5 text-[#BD1B0B]" />
                <span>{activeRecommendation.badge}</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1 tracking-tight">
                {activeRecommendation.title}
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                {activeRecommendation.description}
              </p>
              <Link
                href={activeRecommendation.actionUrl}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#BD1B0B] to-[#D32F2F] hover:from-[#A81507] hover:to-[#BD1B0B] text-white text-xs font-black rounded-2xl shadow-md shadow-red-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>{activeRecommendation.buttonText}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Section: รายวิชา (Clean & Minimal like original) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900 mb-4">รายวิชา</h2>

              <div className="space-y-4">
                {subjectsMetadata.map((subj) => {
                  const count = stats.subjects[subj.id]?.count ?? 0;
                  const score = stats.subjects[subj.id]?.score ?? 0;
                  const catMap: Record<string, string> = {
                    thai: "ภาษาไทย",
                    math: "ทั่วไป",
                    com: "คอม",
                    law: "กฏหมาย",
                    social: "สังคม",
                    eng: "ภาษาอังกฤษ",
                  };
                  const targetCat = catMap[subj.id] || "ภาษาไทย";

                  return (
                    <Link
                      key={subj.id}
                      href={`/exam/session?mode=subject_single&category=${encodeURIComponent(
                        targetCat
                      )}&title=${encodeURIComponent("ทำข้อสอบ " + subj.name + " 30 ข้อ")}`}
                      className="flex items-center gap-3 sm:gap-4 py-1.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-2xl transition-colors cursor-pointer block"
                    >
                      {/* Subject Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl ${subj.bgColor} flex items-center justify-center shrink-0 border border-slate-100`}
                      >
                        {subj.iconType === "text" && (
                          <span
                            className={`text-xs font-black ${subj.iconColor} tracking-wider`}
                          >
                            {subj.iconText}
                          </span>
                        )}
                        {subj.iconType === "brain" && (
                          <Brain className={`w-5 h-5 ${subj.iconColor}`} />
                        )}
                        {subj.iconType === "laptop" && (
                          <Laptop className={`w-5 h-5 ${subj.iconColor}`} />
                        )}
                        {subj.iconType === "scale" && (
                          <Scale className={`w-5 h-5 ${subj.iconColor}`} />
                        )}
                        {subj.iconType === "globe" && (
                          <Globe className={`w-5 h-5 ${subj.iconColor}`} />
                        )}
                      </div>

                      {/* Subject Title & Count */}
                      <div className="w-28 sm:w-36 shrink-0">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight truncate">
                          {subj.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {count} ครั้ง
                        </p>
                      </div>

                      {/* Progress Bar Container */}
                      <div className="flex-1 px-1">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#BD1B0B] h-2 rounded-full transition-all duration-500"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>

                      {/* Percentage Score */}
                      <div className="w-10 text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-[#BD1B0B]">
                          {score}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (4 Columns on Desktop - Premium PC Sidebar) */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            
            {/* Desktop Card 1: User Profile & Countdown */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl ring-2 ring-slate-100 overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#BD1B0B] flex items-center justify-center text-white text-base font-bold">
                      {(displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-slate-900 truncate">
                    {displayName}
                  </h3>
                  <span className="inline-block text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md mt-1">
                    ผู้เตรียมสอบตำรวจ 2569
                  </span>
                </div>
              </div>

              {/* Countdown to Exam */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-red-50/40 border border-red-100/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <Calendar className="w-4 h-4 text-[#BD1B0B]" />
                    <span>วันสอบจริง 29 พ.ย. 2569</span>
                  </div>
                  <span className="text-xs font-black text-[#BD1B0B]">
                    เหลืออีก {examDaysLeft} วัน
                  </span>
                </div>
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#BD1B0B] h-2 rounded-full"
                    style={{ width: "45%" }}
                  />
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full py-2.5 px-4 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>

            {/* Desktop Card 2: สถิติภาพรวม (Desktop Stats Widget) */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
              <h2 className="text-base font-black text-slate-900 mb-4">สถิติภาพรวมของคุณ</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Stat 1: ทำแล้ว */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 leading-tight">
                    {stats.completedSets}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">ชุด</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">ทำแล้ว</span>
                </div>

                {/* Stat 2: เฉลี่ย */}
                <div className="bg-[#FFF5F5] border border-red-200/70 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-[#BD1B0B] leading-tight">
                    {stats.averageScore}%
                  </span>
                  <span className="text-[11px] text-[#BD1B0B] font-bold mt-1">เฉลี่ย</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">คะแนน</span>
                </div>

                {/* Stat 3: สูงสุด */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3 text-center flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 leading-tight">
                    {stats.maxScore}%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">สูงสุด</span>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5">สถิติ</span>
                </div>
              </div>

              {/* Status Note */}
              <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-900 font-medium leading-relaxed">
                เป้าหมายสายอำนวยการ/ปราบปราม ต้องทำคะแนนแต่ละวิชาให้ผ่านเกณฑ์ 60% ขึ้นไปเพื่อติดตัวจริง
              </div>
            </div>

            {/* Desktop Card 3: Quick Action (ข้อสอบแนะนำ Smart Recommendation - White & Red Highlight) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/60 border-2 border-red-500/30 rounded-3xl p-6 shadow-xl shadow-red-500/10 transition-all hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/15">
              {/* Ambient Red Glow */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Highlight Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-100/90 text-[#BD1B0B] border border-red-200/80 shadow-2xs mb-3">
                <Flame className="w-3.5 h-3.5 text-[#BD1B0B]" />
                <span>{activeRecommendation.badge}</span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-black text-slate-900 mb-1.5 tracking-tight">
                {activeRecommendation.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
                {activeRecommendation.description}
              </p>

              {/* Highlight Red Button */}
              <Link
                href={activeRecommendation.actionUrl}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#BD1B0B] to-[#D32F2F] hover:from-[#A81507] hover:to-[#BD1B0B] text-white text-xs font-black rounded-2xl shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>{activeRecommendation.buttonText}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Full-Width Bottom Nav */}
      <MobileBottomNav />

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal
          email={user?.email || ""}
          onClose={() => setShowSupportModal(false)}
        />
      )}
    </div>
  );
}
