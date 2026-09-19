"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight,
  Bell,
  Shield,
  LogOut,
} from "lucide-react";

export interface UserStats {
  totalExams: number;
  avgScore: number;
  maxScore?: number;
  readiness: string;
  subjects: Array<{
    id: string;
    name: string;
    times: string;
    pct: number;
    icon?: string;
  }>;
}

interface HomeViewProps {
  user: {
    name: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
  };
  stats?: UserStats;
  onOpenPretest: () => void;
  onNavigateBank: () => void;
  onNavigateLeaderboard: () => void;
  onOpenImageCompressor: () => void;
  onOpenVocabModal: () => void;
  onNavigateAdmin?: () => void;
  onLogout?: () => void;
}

const SUBJECT_PROGRESS = [
  {
    id: "th",
    name: "ภาษาไทย",
    icon: (
      <span className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 w-8 h-8 rounded-xl flex items-center justify-center">
        TH
      </span>
    ),
    times: "3 ครั้ง",
    pct: 14,
  },
  {
    id: "general",
    name: "ความสามารถทั่วไป",
    icon: (
      <span className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-base">
        🧠
      </span>
    ),
    times: "3 ครั้ง",
    pct: 20,
  },
  {
    id: "computer",
    name: "คอมพิวเตอร์",
    icon: (
      <span className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-base">
        💻
      </span>
    ),
    times: "3 ครั้ง",
    pct: 44,
  },
  {
    id: "law",
    name: "กฎหมาย",
    icon: (
      <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-base">
        ⚖️
      </span>
    ),
    times: "3 ครั้ง",
    pct: 23,
  },
  {
    id: "social",
    name: "สังคม",
    icon: (
      <span className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-base">
        🌍
      </span>
    ),
    times: "2 ครั้ง",
    pct: 10,
  },
  {
    id: "en",
    name: "ภาษาอังกฤษ",
    icon: (
      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 w-8 h-8 rounded-xl flex items-center justify-center">
        EN
      </span>
    ),
    times: "3 ครั้ง",
    pct: 14,
  },
];

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  stats,
  onOpenPretest,
  onNavigateBank,
  onNavigateLeaderboard,
  onOpenImageCompressor,
  onOpenVocabModal,
  onNavigateAdmin,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleAdminClick = () => {
    setIsDropdownOpen(false);
    if (user.role === "ADMIN" || user.role === "OWNER" || !user.role) {
      if (onNavigateAdmin) {
        onNavigateAdmin();
      } else {
        window.location.href = "/admin";
      }
    } else {
      alert("ขออภัย: หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น");
    }
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("police_exam_user");
        window.location.href = "/";
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2 relative">
        <a href="/home" className="flex items-center">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            POLICE<span className="text-police-800">EXAM</span>
          </span>
        </a>

        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้")}
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer touch-manipulation"
          >
            <Bell className="w-5 h-5" />
          </button>

          {/* User Greeting & Avatar Dropdown Trigger */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 -mr-1 rounded-full hover:bg-slate-100/60 transition-colors cursor-pointer text-left touch-manipulation"
          >
            <div className="flex flex-col text-right">
              <span className="text-[11px] text-slate-400 font-medium leading-tight">
                สวัสดีตอนเช้า
              </span>
              <span className="text-sm font-black text-slate-900 leading-tight">
                {user.name}
              </span>
            </div>
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-10 h-10 rounded-full border-2 border-police-800 object-cover shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-police-800 to-rose-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user.name.charAt(0) || "U"}
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu (Exact 1:1 matching user screenshot) */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 px-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* User Header */}
              <div className="px-4 py-2">
                <div className="text-base font-black text-slate-900 leading-snug">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {user.email || "nni893399@gmail.com"}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 my-2 mx-3" />

              {/* Menu List */}
              <div className="flex flex-col gap-1">
                {/* 1. Notifications */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <Bell className="w-5 h-5 text-slate-600" />
                  <span>การแจ้งเตือน</span>
                </button>

                {/* 2. Admin Panel (Red #BD1B0B) */}
                <button
                  type="button"
                  onClick={handleAdminClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-police-800 hover:bg-rose-50/70 transition-colors text-left cursor-pointer"
                >
                  <Shield className="w-5 h-5 text-police-800" />
                  <span>จัดการระบบ (Admin Panel)</span>
                </button>

                {/* 3. Logout */}
                <button
                  type="button"
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-slate-600" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Pretest 150 ข้อ Banner */}
      <button
        type="button"
        onClick={onOpenPretest}
        className="w-full text-left bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-2xl p-5 shadow-lg shadow-red-900/15 transition-all duration-200 cursor-pointer flex items-center justify-between group touch-manipulation"
      >
        <div>
          <h2 className="text-2xl font-black tracking-tight leading-tight">
            Pretest 150 ข้อ
          </h2>
          <p className="text-xs text-white/85 font-medium mt-1">
            สายปราบปราม - สายอำนวยการ
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
          <ChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>

      {/* 2x2 Action Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card 1: บีบอัดรูป */}
        <button
          type="button"
          onClick={onOpenImageCompressor}
          className="bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer touch-manipulation"
        >
          <h3 className="text-base font-extrabold text-slate-900">บีบอัดรูป</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">ลดขนาดไฟล์</p>
        </button>

        {/* Card 2: คลังรายบท */}
        <button
          type="button"
          onClick={onNavigateBank}
          className="bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer touch-manipulation"
        >
          <h3 className="text-base font-extrabold text-slate-900">คลังรายบท</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">เจาะทีละบท</p>
        </button>

        {/* Card 3: อันดับ */}
        <button
          type="button"
          onClick={onNavigateLeaderboard}
          className="bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer touch-manipulation"
        >
          <h3 className="text-base font-extrabold text-police-800">อันดับ</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">ผู้สอบ 150 ข้อ</p>
        </button>

        {/* Card 4: คลังคำศัพท์ */}
        <button
          type="button"
          onClick={onOpenVocabModal}
          className="bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-xs hover:border-slate-300 hover:shadow-md transition-all cursor-pointer touch-manipulation"
        >
          <h3 className="text-base font-extrabold text-slate-900">คลังคำศัพท์</h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">เลือกด่วน !</p>
        </button>
      </div>

      {/* Stats Section */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 mb-2.5">สถิติ</h3>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1: ทำแล้ว */}
          <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-center shadow-xs">
            <div className="text-2xl font-black text-slate-900 leading-tight">
              {stats?.totalExams ?? 0}
              <span className="text-xs font-bold text-slate-600 ml-1">ชุด</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">ทำแล้ว</div>
          </div>

          {/* 2: เฉลี่ย */}
          <div className="bg-[#FFF1F2] border border-[#FFE4E6] rounded-2xl p-3.5 text-center shadow-xs">
            <div className="text-2xl font-black text-police-800 leading-tight">
              {stats?.avgScore ?? 0}
              <span className="text-xs font-extrabold text-police-800 ml-0.5">%</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">เฉลี่ย</div>
          </div>

          {/* 3: สูงสุด */}
          <div className="bg-white border border-slate-100 rounded-2xl p-3.5 text-center shadow-xs">
            <div className="text-2xl font-black text-police-800 leading-tight">
              {stats?.maxScore ?? 0}
              <span className="text-xs font-extrabold text-police-800 ml-0.5">%</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">สูงสุด</div>
          </div>
        </div>
      </div>

      {/* Subject Progress Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-extrabold text-slate-500 tracking-wide">
            รายวิชา
          </h4>
          {stats && stats.totalExams === 0 && (
            <span className="text-[10px] text-police-800 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              สถิติเริ่มจาก 0
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          {(stats?.subjects || SUBJECT_PROGRESS).map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {/* Icon */}
              <div className="shrink-0">
                {typeof item.icon === "string" ? (
                  <span className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                    {item.icon}
                  </span>
                ) : (
                  item.icon
                )}
              </div>

              {/* Subject Title & Times */}
              <div className="w-28 sm:w-36 shrink-0">
                <div className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                  {item.name}
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {item.times}
                </div>
              </div>

              {/* Red Progress Bar */}
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-police-800 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(item.pct, 0)}%` }}
                />
              </div>

              {/* Percent */}
              <div className="w-9 text-right text-xs font-extrabold text-police-800 shrink-0">
                {item.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
