"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Search,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ExamSetItem {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  totalCount: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  _count: { questions: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  "ภาษาไทย": "bg-red-50 text-red-700 border-red-200",
  "ความสามารถทั่วไป": "bg-pink-50 text-pink-700 border-pink-200",
  "คอมพิวเตอร์": "bg-blue-50 text-blue-700 border-blue-200",
  "กฎหมาย": "bg-amber-50 text-amber-700 border-amber-200",
  "กฏหมาย": "bg-amber-50 text-amber-700 border-amber-200",
  "สังคม": "bg-green-50 text-green-700 border-green-200",
  "ภาษาอังกฤษ": "bg-purple-50 text-purple-700 border-purple-200",
  "สารบรรณ": "bg-teal-50 text-teal-700 border-teal-200",
  "ลักษณะที่ 54": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<ExamSetItem[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");

  const fetchSets = async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/exam-sets?email=${encodeURIComponent(userEmail)}`);
      if (res.status === 403) { router.replace("/home"); return; }
      if (!res.ok) throw new Error("โหลดข้อมูลไม่ได้");
      setSets(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email) { router.replace("/home"); return; }
      setEmail(session.user.email);
      fetchSets(session.user.email);
    });
  }, []);

  const filtered = sets.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce<Record<string, ExamSetItem[]>>((acc, s) => {
    const key = s.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-sm font-black text-slate-900 mb-4">{error}</p>
        <Link href="/admin" className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl">กลับ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link href="/admin" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#BD1B0B] text-xs font-bold mb-2 group transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Admin Panel
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#BD1B0B] flex items-center justify-center shadow-lg shadow-red-800/20">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">จัดการข้อสอบ</h1>
                <p className="text-xs text-slate-400">{sets.length} ชุดข้อสอบทั้งหมด</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => fetchSets(email)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรช
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชุดข้อสอบหรือวิชา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#BD1B0B] focus:ring-1 focus:ring-[#BD1B0B]/20"
          />
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 text-center shadow-xs">
            <p className="text-xl font-black text-slate-900">{sets.length}</p>
            <p className="text-xs text-slate-400 font-medium">ชุดข้อสอบ</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 text-center shadow-xs">
            <p className="text-xl font-black text-emerald-600">
              {sets.reduce((s, e) => s + e._count.questions, 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 font-medium">ข้อสอบทั้งหมด</p>
          </div>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 text-center shadow-xs">
            <p className="text-xl font-black text-slate-900">{Object.keys(grouped).length}</p>
            <p className="text-xs text-slate-400 font-medium">วิชา</p>
          </div>
        </div>

        {/* Grouped by category */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${CATEGORY_COLORS[cat] || "bg-slate-50 text-slate-700 border-slate-200"}`}>
                  {cat}
                </span>
                <span className="text-xs text-slate-400 font-medium">{items.length} ชุด</span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                {items.map((set, idx) => (
                  <Link
                    key={set.id}
                    href={`/admin/questions/${set.id}`}
                    className={`flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors group ${idx !== items.length - 1 ? "border-b border-slate-100" : ""}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-xs font-black text-slate-500">
                        {set.id}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{set.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{set._count.questions} ข้อ</span>
                          {set.subcategory && (
                            <span className="text-xs text-slate-400">· {set.subcategory}</span>
                          )}
                          <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${set.isPublic ? "text-emerald-600" : "text-slate-400"}`}>
                            {set.isPublic ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {set.isPublic ? "เผยแพร่" : "ซ่อน"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#BD1B0B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
