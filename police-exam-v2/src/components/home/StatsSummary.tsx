"use client";

import React from "react";

interface StatsSummaryProps {
  completedSets?: number;
  averageScore?: number;
  maxScore?: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  completedSets = 0,
  averageScore = 0,
  maxScore = 0,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900">
          สถิติการฝึกทำข้อสอบ
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Card 1: Completed Sets */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 text-center shadow-2xs">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {completedSets}
            <span className="text-xs font-semibold text-slate-400 ml-1">ชุด</span>
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">ทำแล้ว</div>
        </div>

        {/* Card 2: Average Score */}
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5 sm:p-4 text-center shadow-2xs">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-police-800 leading-tight">
            {averageScore}
            <span className="text-xs font-bold text-police-800 ml-0.5">%</span>
          </div>
          <div className="text-xs font-semibold text-rose-700/80 mt-1">เฉลี่ย</div>
        </div>

        {/* Card 3: Max Score */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 text-center shadow-2xs">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-police-800 leading-tight">
            {maxScore}
            <span className="text-xs font-bold text-police-800 ml-0.5">%</span>
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">สูงสุด</div>
        </div>
      </div>
    </div>
  );
};
