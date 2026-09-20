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
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface AdminOverviewData {
  totalUsers: number;
  totalQuestions: number;
  totalAttempts: number;
  reportedCount: number;
  recentReports: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");

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
        // Not admin
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
        <Link
          href="/home"
          className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl"
        >
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
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

        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Users */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-bold">ผู้ใช้งานทั้งหมด</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {data.totalUsers.toLocaleString()} <span className="text-xs font-normal text-slate-400">คน</span>
            </h3>
          </div>

          {/* Card 2: Questions */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-bold">คลังข้อสอบทั้งหมด</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {data.totalQuestions.toLocaleString()} <span className="text-xs font-normal text-slate-400">ข้อ</span>
            </h3>
          </div>

          {/* Card 3: Attempts */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-bold">รอบการสอบที่บันทึก</p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {data.totalAttempts.toLocaleString()} <span className="text-xs font-normal text-slate-400">รอบ</span>
            </h3>
          </div>

          {/* Card 4: Reports */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Flag className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400 font-bold">ข้อสอบที่ถูกแจ้งผิด</p>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {data.reportedCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">รายการ</span>
            </h3>
          </div>
        </div>

        {/* Reported Questions List */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                รายการข้อสอบที่ผู้สอบแจ้งข้อผิดพลาดล่าสุด
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                ตรวจสอบและแก้ไขข้อสอบที่มีข้อผิดพลาดในคลัง
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {data.recentReports.length} รายการล่าสุด
            </span>
          </div>

          {data.recentReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-slate-700">ไม่มีรายการข้อผิดพลาดที่ค้างอยู่</p>
              <p className="text-slate-400 mt-0.5">ข้อสอบในคลังมีความสมบูรณ์</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentReports.map((report: any) => (
                <div key={report.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      ข้อที่: #{report.questionId}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(report.createdAt).toLocaleString("th-TH")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 line-clamp-1">
                    {report.questionText}
                  </p>
                  <p className="text-xs text-amber-700 font-medium bg-amber-50/70 px-2.5 py-1 rounded-xl">
                    เหตุผลที่แจ้ง: {report.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
