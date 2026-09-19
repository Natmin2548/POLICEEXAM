"use client";

import React from "react";

interface NavbarProps {
  onOpenLogin: () => void;
  user?: {
    name: string;
    avatarUrl?: string;
  } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin, user, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-1.5 group transition-transform active:scale-95">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
            POLICE<span className="text-police-800">EXAM</span>
          </span>
        </a>

        {/* Right Navigation Actions */}
        <nav className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                {user.avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-police-800 object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-police-800 to-rose-700 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
                    {user.name.charAt(0) || "U"}
                  </div>
                )}
                <span className="hidden sm:inline font-semibold text-sm text-slate-800 truncate max-w-[120px]">
                  {user.name}
                </span>
              </div>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-police-50 text-police-800 border border-police-800/15 hover:bg-police-800 hover:text-white transition-colors cursor-pointer"
                >
                  ออกจากระบบ
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-police-800 hover:bg-police-700 active:scale-95 text-white shadow-sm shadow-police-800/20 transition-all cursor-pointer touch-manipulation"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
