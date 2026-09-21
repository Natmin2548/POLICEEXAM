"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Flag,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface DetailsData {
  recentReports: any[];
  recentTickets: any[];
  supportTicketCount: number;
  reportedCount: number;
}

export default function AdminDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DetailsData | null>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { router.replace("/home"); return; }

      const res = await fetch(`/api/admin/overview?email=${encodeURIComponent(session.user.email)}`);
      if (res.status === 403) { router.replace("/home"); return; }
      if (!res.ok) throw new Error("ไม่สามารถโหลดข้อมูลได้");

      const d = await res.json();
      setData({
        recentReports: d.recentReports,
        recentTickets: d.recentTickets,
        supportTicketCount: d.supportTicketCount,
        reportedCount: d.reportedCount,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-sm font-black text-slate-900 mb-4">{error || "ไม่มีสิทธิ์เข้าถึง"}</p>
        <Link href="/admin" className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl">กลับ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#BD1B0B] text-xs font-bold transition-colors mb-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              กลับหน้าภาพรวม
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Shield className="w-7 h-7 text-[#BD1B0B]" />
              รายละเอียดการแจ้ง
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">ร้องขอ / แจ้งเรื่อง และข้อสอบผิดพลาด</p>
          </div>
          <button type="button" onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer self-start sm:self-auto">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            รีเฟรช
          </button>
        </div>

        {/* Support Tickets */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#BD1B0B]" />
                ร้องขอ / แจ้งเรื่องจากผู้ใช้
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">คำขอที่ผู้ใช้ส่งตรงถึงแอดมิน</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              data.supportTicketCount > 0
                ? "bg-red-50 text-[#BD1B0B] border-red-100"
                : "bg-slate-100 text-slate-600 border-transparent"
            }`}>
              {data.recentTickets.length} รายการ
            </span>
          </div>

          {data.recentTickets.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">ไม่มีคำร้องขอที่รอดำเนินการ</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentTickets.map((ticket: any) => (
                <div key={ticket.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-slate-700">{ticket.user?.email || "-"}</span>
                    <span className="text-slate-400 text-[11px] shrink-0">
                      {new Date(ticket.createdAt).toLocaleString("th-TH")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed mb-2">{ticket.message}</p>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-lg ${
                    ticket.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {ticket.status === "PENDING" ? "⏳ รอดำเนินการ" : "✅ ดำเนินการแล้ว"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reported Questions */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-500" />
                ข้อสอบที่ผู้สอบแจ้งผิดพลาด
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">ตรวจสอบและแก้ไขในคลังข้อสอบ</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {data.recentReports.length} รายการ
            </span>
          </div>

          {data.recentReports.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">ไม่มีรายการข้อผิดพลาดค้างอยู่</p>
              <p className="text-xs text-slate-400 mt-0.5">ข้อสอบในคลังสมบูรณ์</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentReports.map((report: any) => (
                <div key={report.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-700">ข้อที่: #{report.questionId}</span>
                    <span className="text-slate-400 text-[11px] shrink-0">
                      {new Date(report.createdAt).toLocaleString("th-TH")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 line-clamp-2 mb-2">{report.questionText}</p>
                  <p className="text-xs text-amber-800 font-medium bg-amber-50 px-3 py-1.5 rounded-xl">
                    🚩 {report.reason}
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
