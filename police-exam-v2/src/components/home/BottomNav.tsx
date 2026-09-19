"use client";

import React from "react";
import { Home, BookOpen, Trophy } from "lucide-react";

export type HomeTab = "home" | "bank" | "leaderboard";

interface BottomNavProps {
  activeTab: HomeTab;
  onChangeTab: (tab: HomeTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-full px-6 py-2.5 shadow-xl shadow-slate-900/10 flex items-center gap-7 sm:gap-10">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onChangeTab("home")}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "home" ? "text-police-800" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>หน้าหลัก</span>
        </button>

        {/* Tab 2: Bank */}
        <button
          type="button"
          onClick={() => onChangeTab("bank")}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "bank" ? "text-police-800" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>คลัง</span>
        </button>

        {/* Tab 3: Leaderboard */}
        <button
          type="button"
          onClick={() => onChangeTab("leaderboard")}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
            activeTab === "leaderboard" ? "text-police-800" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span>อันดับ</span>
        </button>
      </div>
    </div>
  );
};
