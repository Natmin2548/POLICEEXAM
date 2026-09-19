"use client";

import React, { useState } from "react";
import { RotateCw } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatarChar: string;
  track: "สายปราบปราม" | "สายอำนวยการ";
  date: string;
  timeUsed: string;
  score: number;
  total: number;
}

const SAMPLE_LEADERBOARD: LeaderboardUser[] = [
  {
    rank: 1,
    name: "Jj K",
    avatarChar: "J",
    track: "สายอำนวยการ",
    date: "18 ก.ย. 69",
    timeUsed: "23 นาที 7 วิ",
    score: 134,
    total: 150,
  },
  {
    rank: 2,
    name: "Saranphat Inpinit",
    avatarChar: "S",
    track: "สายอำนวยการ",
    date: "16 ก.ย. 69",
    timeUsed: "1 ชม. 15 นาที",
    score: 129,
    total: 150,
  },
  {
    rank: 3,
    name: "SPRINGER Psycho",
    avatarChar: "S",
    track: "สายอำนวยการ",
    date: "17 ก.ย. 69",
    timeUsed: "1 ชม. 38 นาที",
    score: 125,
    total: 150,
  },
  {
    rank: 4,
    name: "Narakorn Arrampajit",
    avatarChar: "N",
    track: "สายอำนวยการ",
    date: "18 ก.ย. 69",
    timeUsed: "2 ชม. 11 นาที",
    score: 121,
    total: 150,
  },
  {
    rank: 5,
    name: "จิรทีปต์ จันทรักษ์",
    avatarChar: "จ",
    track: "สายอำนวยการ",
    date: "16 ก.ย. 69",
    timeUsed: "2 ชม. 2 นาที",
    score: 116,
    total: 150,
  },
  {
    rank: 6,
    name: "Hello catty",
    avatarChar: "H",
    track: "สายอำนวยการ",
    date: "16 ก.ย. 69",
    timeUsed: "26 นาที 46 วิ",
    score: 112,
    total: 150,
  },
  {
    rank: 7,
    name: "ฐานิดา แหล่งสนาม",
    avatarChar: "ฐ",
    track: "สายอำนวยการ",
    date: "15 ก.ย. 69",
    timeUsed: "1 ชม. 43 นาที",
    score: 112,
    total: 150,
  },
];

interface LeaderboardViewProps {
  onStartPretest: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onStartPretest }) => {
  const [selectedTrack, setSelectedTrack] = useState<"all" | "prabpram" | "amnuaykan">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const filteredUsers = SAMPLE_LEADERBOARD.filter((u) => {
    if (selectedTrack === "prabpram") return u.track === "สายปราบปราม";
    if (selectedTrack === "amnuaykan") return u.track === "สายอำนวยการ";
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            ตารางอันดับ 150 ข้อ
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            คะแนนสูงสุดและเวลาเร็วที่สุด
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-police-800" : ""}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* My Rank Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ม
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">มิน</span>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  อันดับของฉัน
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                มีผลสอบในระบบ • สอบเมื่อ 15 ก.ย. 69
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onStartPretest}
            className="px-4 py-2 rounded-xl bg-police-800 hover:bg-police-700 active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer touch-manipulation"
          >
            ทำข้อสอบ 150 ข้อ
          </button>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1: อันดับ */}
          <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">อันดับ</div>
            <div className="text-lg font-black text-police-800 mt-0.5">
              #33 <span className="text-xs text-slate-400 font-bold">/ 35</span>
            </div>
          </div>

          {/* 2: คะแนนสูงสุด */}
          <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">คะแนนสูงสุด</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              42 <span className="text-xs text-slate-400 font-bold">/ 150</span>
            </div>
          </div>

          {/* 3: เวลาเร็วที่สุด */}
          <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">เวลาเร็วที่สุด</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">2 นาที 40 วิ</div>
          </div>

          {/* 4: สายสอบ */}
          <div className="bg-slate-50/80 rounded-2xl p-3 text-center border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400">สายสอบ</div>
            <div className="text-sm font-extrabold text-slate-900 mt-1">สายปราบปราม</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-1 border-b border-slate-200/80">
        <button
          type="button"
          onClick={() => setSelectedTrack("all")}
          className={`pb-2 px-1 text-xs font-bold transition-all cursor-pointer ${
            selectedTrack === "all"
              ? "text-slate-900 border-b-2 border-police-800"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          ทั้งหมด
        </button>
        <button
          type="button"
          onClick={() => setSelectedTrack("prabpram")}
          className={`pb-2 px-1 text-xs font-bold transition-all cursor-pointer ${
            selectedTrack === "prabpram"
              ? "text-slate-900 border-b-2 border-police-800"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          สายปราบปราม
        </button>
        <button
          type="button"
          onClick={() => setSelectedTrack("amnuaykan")}
          className={`pb-2 px-1 text-xs font-bold transition-all cursor-pointer ${
            selectedTrack === "amnuaykan"
              ? "text-slate-900 border-b-2 border-police-800"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          สายอำนวยการ
        </button>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span className="w-1/2"># ผู้เข้าสอบ</span>
          <span className="w-1/4 text-center">เวลา</span>
          <span className="w-1/4 text-right">คะแนน</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-100">
          {filteredUsers.map((user) => {
            const isTop3 = user.rank <= 3;
            return (
              <div
                key={user.rank}
                className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
              >
                {/* User column */}
                <div className="w-1/2 flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs shrink-0 ${
                      isTop3
                        ? "bg-slate-800 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.rank}
                  </span>

                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {user.avatarChar}
                  </div>

                  <div className="truncate">
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        {user.track}
                      </span>
                      <span className="text-[10px] text-slate-400">{user.date}</span>
                    </div>
                  </div>
                </div>

                {/* Time column */}
                <div className="w-1/4 text-center text-xs font-semibold text-slate-600">
                  {user.timeUsed}
                </div>

                {/* Score column */}
                <div className="w-1/4 text-right text-xs font-black text-police-800">
                  {user.score}
                  <span className="text-[10px] font-bold text-slate-400 ml-0.5">
                    /{user.total}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
