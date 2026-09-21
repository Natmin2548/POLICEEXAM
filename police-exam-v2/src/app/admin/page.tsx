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
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  LayoutDashboard,
  List,
  Award,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AdminOverviewData {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  premiumUsers: number;
  totalQuestions: number;
  totalExamSets: number;
  totalAttempts: number;
  attemptsToday: number;
  avgScore: number;
  reportedCount: number;
  recentReports: any[];
  supportTicketCount: number;
  recentTickets: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.replace("/home");
        return;
      }

      setUserEmail(session.user.email);

      const res = await fetch(
        `/api/admin/overview?email=${encodeURIComponent(session.user.email)}`
      );

      if (res.status === 403) {
        router.replace("/home");
        return;
      }

      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลผู้ดูแลระบบได้");
      }

      const resData = await res.json();
      setData(resData);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
        <p className="text-sm font-black text-slate-800">กำลังตรวจสอบสิทธิ์ Admin...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-base font-black text-slate-900 mb-1">{error || "ไม่มีสิทธิ์เข้าถึง"}</h2>
        <p className="text-xs text-slate-500 mb-5">หน้านี้สำหรับผู้ดูแลระบบ (ADMIN) เท่านั้น</p>
        <Link href="/home" className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl">
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 text-slate-500 hover:text-[#BD1B0B] text-xs font-bold transition-colors mb-2 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>กลับสู่หน้าหลักผู้ใช้</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-[#BD1B0B]" />
              <span>จัดการระบบ (Admin Panel)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
              ภาพรวมระบบ POLICE EXAM และข้อมูลการใช้งาน ({userEmail})
            </p>
          </div>

          <button
            type="button"
            onClick={fetchAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer self-start sm:self-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            ภาพรวม
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeTab === "details"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            รายละเอียด
            {(data.reportedCount > 0 || data.supportTicketCount > 0) && (
              <span className="ml-1 w-4 h-4 rounded-full bg-[#BD1B0B] text-white text-[10px] flex items-center justify-center">
                {data.reportedCount + data.supportTicketCount}
              </span>
            )}
          </button>
        </div>

        {/* ===== TAB 1: OVERVIEW ===== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Row 1: User Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">ผู้ใช้งานทั้งหมด</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {data.totalUsers.toLocaleString()} <span className="text-xs font-normal text-slate-400">คน</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  <span className="text-emerald-600 font-bold">+{data.newUsersToday}</span> วันนี้ &nbsp;·&nbsp;
                  <span className="text-blue-500 font-bold">+{data.newUsersThisWeek}</span> สัปดาห์นี้
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">ผู้ใช้ Premium</p>
                <h3 className="text-2xl sm:text-3xl font-black text-yellow-600 mt-1">
                  {data.premiumUsers.toLocaleString()} <span className="text-xs font-normal text-slate-400">คน</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  {data.totalUsers > 0 ? Math.round((data.premiumUsers / data.totalUsers) * 100) : 0}% ของผู้ใช้ทั้งหมด
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">รอบการสอบทั้งหมด</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {data.totalAttempts.toLocaleString()} <span className="text-xs font-normal text-slate-400">รอบ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  <span className="text-purple-600 font-bold">+{data.attemptsToday}</span> วันนี้
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">คะแนนเฉลี่ยผู้ใช้</p>
                <h3 className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
                  {data.avgScore}<span className="text-xs font-normal text-slate-400">%</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">จากทุกรอบการสอบ</p>
              </div>
            </div>

            {/* Row 2: Content Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">คลังข้อสอบ</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {data.totalQuestions.toLocaleString()} <span className="text-xs font-normal text-slate-400">ข้อ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1.5">ใน {data.totalExamSets} ชุดข้อสอบ</p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Flag className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-bold">ข้อสอบที่ถูกแจ้งผิด</p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                  {data.reportedCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">รายการ</span>
                </h3>
                {data.reportedCount > 0 && (
                  <button type="button" onClick={() => setActiveTab("details")} className="text-xs text-amber-600 font-bold mt-1.5 cursor-pointer hover:underline">
                    ดูรายละเอียด →
                  </button>
                )}
              </div>

              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#BD1B0B] flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">ร้องขอ / แจ้งเรื่อง</p>
                      <p className="text-xs text-slate-400 font-medium">รอดำเนินการจากผู้ใช้</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#BD1B0B]">{data.supportTicketCount}</span>
                    <span className="text-xs text-slate-400 ml-1">รายการ</span>
                  </div>
                </div>
                {data.supportTicketCount > 0 && (
                  <button type="button" onClick={() => setActiveTab("details")} className="mt-3 w-full py-2.5 text-xs font-black text-[#BD1B0B] bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer">
                    ดูรายละเอียดทั้งหมด →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB 2: DETAILS ===== */}
        {activeTab === "details" && (
          <div className="space-y-6">

            {/* Support Tickets Section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4.5 h-4.5 text-[#BD1B0B]" />
                    ร้องขอ / แจ้งเรื่องจากผู้ใช้
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">คำขอที่ผู้ใช้ส่งตรงถึงแอดมิน</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 text-[#BD1B0B] border border-red-100">
                  {data.recentTickets.length} รายการ
                </span>
              </div>

              {data.recentTickets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-slate-700">ไม่มีคำร้องขอที่รอดำเนินการ</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentTickets.map((ticket: any) => (
                    <div key={ticket.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{ticket.user?.email || "-"}</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(ticket.createdAt).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed">{ticket.message}</p>
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-lg ${
                        ticket.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {ticket.status === "PENDING" ? "รอดำเนินการ" : "ดำเนินการแล้ว"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reported Questions Section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Flag className="w-4.5 h-4.5 text-amber-500" />
                    รายการข้อสอบที่ผู้สอบแจ้งข้อผิดพลาด
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">ตรวจสอบและแก้ไขข้อสอบในคลัง</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                  {data.recentReports.length} รายการ
                </span>
              </div>

              {data.recentReports.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-bold text-slate-700">ไม่มีรายการข้อผิดพลาดที่ค้างอยู่</p>
                  <p className="text-slate-400 mt-0.5">ข้อสอบในคลังมีความสมบูรณ์</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentReports.map((report: any) => (
                    <div key={report.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">ข้อที่: #{report.questionId}</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(report.createdAt).toLocaleString("th-TH")}
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 line-clamp-1">{report.questionText}</p>
                      <p className="text-xs text-amber-700 font-medium bg-amber-50/70 px-2.5 py-1 rounded-xl">
                        เหตุผลที่แจ้ง: {report.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
