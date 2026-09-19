"use client";

import React from "react";
import { ChevronRight, Award } from "lucide-react";

interface PretestBannerProps {
  onStartPretest?: () => void;
}

export const PretestBanner: React.FC<PretestBannerProps> = ({ onStartPretest }) => {
  return (
    <div
      onClick={onStartPretest}
      className="w-full bg-gradient-to-r from-police-800 to-rose-700 hover:from-police-900 hover:to-rose-800 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg shadow-police-800/20 transition-all duration-200 cursor-pointer flex items-center justify-between group touch-manipulation"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
          <Award className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Pretest 150 ข้อ
          </h2>
          <p className="text-xs sm:text-sm text-white/85 font-medium mt-0.5">
            สนามสอบเสมือนจริง • สายปราบปราม - สายอำนวยการ
          </p>
        </div>
      </div>

      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
        <ChevronRight className="w-5 h-5 text-white" />
      </div>
    </div>
  );
};
