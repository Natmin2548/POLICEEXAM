"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, Trophy, AlertTriangle } from "lucide-react";

interface LeaderboardItem {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  branch: string;
  date: string;
  timeText: string;
  score: number;
  total: number;
}

interface MyRankInfo {
  hasExam: boolean;
  rank: number | null;
  totalParticipants: number;
  maxScore: number;
  totalScore: number;
  fastestTime: string;
  branch: string;
  date: string | null;
}

interface LeaderboardTabProps {
  userEmail?: string | null;
  displayName: string;
  avatarUrl?: string;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  userEmail,
  displayName,
  avatarUrl,
}) => {
  const [branchFilter, setBranchFilter] = useState<"all" | "suppression" | "admin">("all");
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [myRank, setMyRank] = useState<MyRankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const emailParam = userEmail ? encodeURIComponent(userEmail) : "";
      const res = await fetch(
        `/api/leaderboard?email=${emailParam}&branch=${branchFilter}&_t=${Date.now()}`
      );
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลอันดับได้ กรุณาลองใหม่อีกครั้ง");
      }
      const data = await res.json();
      setItems(data.leaderboard || []);
      setMyRank(data.myRank || null);
    } catch (err: any) {
      setError(err.message || "ไม่สามารถโหลดข้อมูลอันดับได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [branchFilter, userEmail]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ตารางอันดับ 150 ข้อ
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            คะแนนสูงสุดและเวลาเร็วที่สุด
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={fetchLeaderboard}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading ? "animate-spin" : ""}`} />
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* User's Own Rank Card (My Rank Banner) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* User Info Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* User Avatar */}
            <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center text-white font-black text-base shadow-xs shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(displayName || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">
                  {displayName}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                  อันดับของฉัน
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>
                  {myRank?.hasExam
                    ? `มีผลสอบในระบบ • สอบเมื่อ ${myRank.date || "เร็วๆ นี้"}`
                    : "ยังไม่มีผลสอบ 150 ข้อในระบบ"}
                </span>
              </p>
            </div>
          </div>

          {/* Action Button: ทำข้อสอบ 150 ข้อ */}
          <Link
            href="/exam"
            className="py-2.5 px-5 bg-[#BD1B0B] hover:bg-[#A81507] text-white text-xs sm:text-sm font-black rounded-2xl transition-all cursor-pointer text-center shadow-md shadow-red-950/20 active:scale-[0.99] self-start sm:self-auto"
          >
            ทำข้อสอบ 150 ข้อ
          </Link>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Stat 1: อันดับ */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">อันดับ</span>
            <div className="flex items-baseline justify-center gap-1 leading-none">
              <span className="text-lg sm:text-xl font-black text-[#BD1B0B]">
                {myRank?.rank ? `#${myRank.rank}` : "-"}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {myRank?.totalParticipants ? `/ ${myRank.totalParticipants}` : ""}
              </span>
            </div>
          </div>

          {/* Stat 2: คะแนนสูงสุด */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">คะแนนสูงสุด</span>
            <div className="flex items-baseline justify-center gap-1 leading-none">
              <span className="text-lg sm:text-xl font-black text-slate-900">
                {myRank?.maxScore ? myRank.maxScore : "-"}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 150</span>
            </div>
          </div>

          {/* Stat 3: เวลาเร็วที่สุด */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">เวลาเร็วที่สุด</span>
            <span className="text-xs sm:text-sm font-black text-slate-800 leading-none py-1">
              {myRank?.fastestTime || "-"}
            </span>
          </div>

          {/* Stat 4: สายสอบ */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 text-center flex flex-col items-center justify-center">
            <span className="text-[11px] text-slate-400 font-medium mb-1">สายสอบ</span>
            <span className="text-xs sm:text-sm font-black text-slate-800 leading-none py-1 truncate max-w-[130px]">
              {myRank?.branch || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Branch Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setBranchFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            branchFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          ทั้งหมด
        </button>

        <button
          type="button"
          onClick={() => setBranchFilter("suppression")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            branchFilter === "suppression"
              ? "bg-[#BD1B0B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          สายปราบปราม
        </button>

        <button
          type="button"
          onClick={() => setBranchFilter("admin")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
            branchFilter === "admin"
              ? "bg-[#BD1B0B] text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          สายอำนวยการ
        </button>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 sm:px-6 py-3 border-b border-slate-100 text-[11px] sm:text-xs font-bold text-slate-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 sm:col-span-7">ผู้เข้าสอบ</div>
          <div className="col-span-3 sm:col-span-2 text-right">เวลา</div>
          <div className="col-span-2 text-right">คะแนน</div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-red-200 border-t-[#BD1B0B] animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400 font-bold">กำลังโหลดตารางอันดับ...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-12 text-center text-red-600 px-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Data Rows */}
        {!loading && !error && (
          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const isTop3 = item.rank <= 3;
              const isFirst = item.rank === 1;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center px-4 sm:px-6 py-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  {/* Rank Badge Column */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isTop3
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.rank}
                    </div>
                  </div>

                  {/* Candidate Info Column */}
                  <div className="col-span-6 sm:col-span-7 flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* User Avatar Initial */}
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-700 shrink-0">
                      {(item.name || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50 truncate">
                          {item.branch}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Column */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <span className="text-xs sm:text-sm font-bold text-slate-700">
                      {item.timeText}
                    </span>
                  </div>

                  {/* Score Column */}
                  <div className="col-span-2 text-right leading-none">
                    <span className="text-xs sm:text-sm font-black text-[#BD1B0B]">
                      {item.score}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      /{item.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
