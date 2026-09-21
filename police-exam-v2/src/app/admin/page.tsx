"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  HelpCircle,
  BarChart3,
  Flag,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Award,
  TrendingUp,
  Activity,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface OverviewData {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  premiumUsers: number;
  totalQuestions: number;
  totalExamSets: number;
  totalAttempts: number;
  attemptsToday: number;
  avgScore: number;
  onlineUsers: number;
  reportedCount: number;
  supportTicketCount: number;
}

function StatCard({
  icon,
  label,
  value,
  unit,
  sub,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  sub?: React.ReactNode;
  color?: "blue" | "yellow" | "purple" | "emerald" | "red" | "amber";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-[#BD1B0B]",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-xs text-slate-400 font-semibold tracking-wide mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black text-slate-900">{value}</span>
        {unit && <span className="text-xs font-medium text-slate-400">{unit}</span>}
      </div>
      {sub && <div className="mt-1.5">{sub}</div>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { router.replace("/home"); return; }
      setUserEmail(session.user.email);

      const res = await fetch(`/api/admin/overview?email=${encodeURIComponent(session.user.email)}`);
      if (res.status === 403) { router.replace("/home"); return; }
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");

      const d = await res.json();
      setData(d);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin" />
        <p className="text-sm font-black text-slate-700">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-base font-black text-slate-900 mb-1">{error || "ไม่มีสิทธิ์เข้าถึง"}</h2>
        <p className="text-xs text-slate-500 mb-5">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
        <Link href="/home" className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link href="/home" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#BD1B0B] text-xs font-bold mb-2 group transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              กลับหน้าหลัก
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#BD1B0B] flex items-center justify-center shadow-lg shadow-red-800/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-400">{userEmail}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 hidden sm:block">
                อัพเดท {lastUpdated.toLocaleTimeString("th-TH")}
              </span>
            )}
            <button type="button" onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-xs cursor-pointer transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              รีเฟรช
            </button>
          </div>
        </div>

        {/* Online Users Hero */}
        <div className="bg-gradient-to-br from-[#BD1B0B] to-[#8B0000] rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-red-900/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                </span>
                <p className="text-xs font-bold text-red-200 uppercase tracking-widest">ออนไลน์ขณะนี้</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black">{data.onlineUsers}</span>
                <span className="text-lg font-medium text-red-200">คน</span>
              </div>
              <p className="text-xs text-red-300 mt-1">ผู้ใช้ที่ active ใน 5 นาทีที่ผ่านมา</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-red-200 mb-0.5">ผู้ใช้ทั้งหมด</p>
                <p className="text-xl font-black">{data.totalUsers.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-red-200 mb-0.5">สมัครวันนี้</p>
                <p className="text-xl font-black">+{data.newUsersToday}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-red-200 mb-0.5">สอบวันนี้</p>
                <p className="text-xl font-black">+{data.attemptsToday}</p>
              </div>
              <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-xs text-red-200 mb-0.5">คะแนนเฉลี่ย</p>
                <p className="text-xl font-black">{data.avgScore}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">สถิติผู้ใช้</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={<Users className="w-5 h-5" />}
              label="ผู้ใช้งานทั้งหมด"
              value={data.totalUsers.toLocaleString()}
              unit="คน"
              color="blue"
              sub={<p className="text-xs text-slate-400">
                <span className="text-emerald-600 font-bold">+{data.newUsersToday}</span> วันนี้ &nbsp;
                <span className="text-blue-500 font-bold">+{data.newUsersThisWeek}</span> สัปดาห์
              </p>}
            />
            <StatCard
              icon={<Award className="w-5 h-5" />}
              label="ผู้ใช้ Premium"
              value={data.premiumUsers.toLocaleString()}
              unit="คน"
              color="yellow"
              sub={<p className="text-xs text-slate-400">
                {data.totalUsers > 0 ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0}% ของผู้ใช้
              </p>}
            />
            <StatCard
              icon={<BarChart3 className="w-5 h-5" />}
              label="รอบการสอบทั้งหมด"
              value={data.totalAttempts.toLocaleString()}
              unit="รอบ"
              color="purple"
              sub={<p className="text-xs text-purple-600 font-bold">+{data.attemptsToday} วันนี้</p>}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="คะแนนเฉลี่ย"
              value={data.avgScore}
              unit="%"
              color="emerald"
              sub={<p className="text-xs text-slate-400">จากทุกรอบการสอบ</p>}
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">ข้อมูลระบบ</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={<HelpCircle className="w-5 h-5" />}
              label="คลังข้อสอบ"
              value={data.totalQuestions.toLocaleString()}
              unit="ข้อ"
              color="emerald"
              sub={<p className="text-xs text-slate-400">ใน {data.totalExamSets} ชุด</p>}
            />
            <StatCard
              icon={<BookOpen className="w-5 h-5" />}
              label="ชุดข้อสอบ"
              value={data.totalExamSets.toLocaleString()}
              unit="ชุด"
              color="blue"
            />
            <StatCard
              icon={<Flag className="w-5 h-5" />}
              label="แจ้งข้อสอบผิด"
              value={data.reportedCount}
              unit="รายการ"
              color="amber"
            />
            <StatCard
              icon={<MessageSquare className="w-5 h-5" />}
              label="ร้องขอรอดำเนินการ"
              value={data.supportTicketCount}
              unit="รายการ"
              color="red"
            />
          </div>
        </div>

        {/* Quick Link to Details */}
        {(data.reportedCount > 0 || data.supportTicketCount > 0) && (
          <Link href="/admin/details"
            className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-5 py-4 shadow-xs hover:shadow-md hover:border-[#BD1B0B]/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-[#BD1B0B] flex items-center justify-center">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">มีรายการรอดำเนินการ</p>
                <p className="text-xs text-slate-400">
                  {data.supportTicketCount > 0 && `${data.supportTicketCount} คำร้องขอ`}
                  {data.supportTicketCount > 0 && data.reportedCount > 0 && " · "}
                  {data.reportedCount > 0 && `${data.reportedCount} ข้อสอบที่แจ้งผิด`}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#BD1B0B] group-hover:translate-x-0.5 transition-all" />
          </Link>
        )}

      </div>
    </div>
  );
}
