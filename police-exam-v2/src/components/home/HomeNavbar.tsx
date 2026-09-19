"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface HomeNavbarProps {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  onLogout?: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  user = { name: "ผู้ใช้งาน", email: "user@policeexam.com" },
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <a href="/home" className="flex items-center gap-1">
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            POLICE<span className="text-police-800">EXAM</span>
          </span>
        </a>

        {/* Right: User Profile & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            {user.avatarUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-police-800 object-cover shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-police-800 to-rose-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user.name.charAt(0) || "U"}
              </div>
            )}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs text-slate-400 font-medium">ยินดีต้อนรับ</span>
              <span className="text-sm font-bold text-slate-800 leading-tight">
                {user.name}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="ออกจากระบบ"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-500 hover:text-police-800 hover:bg-police-50 border border-transparent hover:border-police-800/15 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ออก</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
