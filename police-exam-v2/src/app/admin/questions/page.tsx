"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Search,
  X,
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

const CHIP_COLORS: Record<string, string> = {
  "ภาษาไทย": "bg-red-600",
  "ความสามารถทั่วไป": "bg-pink-600",
  "คอมพิวเตอร์": "bg-blue-600",
  "กฎหมาย": "bg-amber-600",
  "กฏหมาย": "bg-amber-600",
  "สังคม": "bg-green-600",
  "ภาษาอังกฤษ": "bg-purple-600",
  "สารบรรณ": "bg-teal-600",
  "ลักษณะที่ 54": "bg-orange-600",
};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState<ExamSetItem[]>([]);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

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

  // Derived: unique categories
  const categories = Array.from(new Set(sets.map((s) => s.category)));

  // Derived: subcategories for selected cat
  const subcategories = selectedCat
    ? Array.from(new Set(
        sets
          .filter((s) => s.category === selectedCat && s.subcategory)
          .map((s) => s.subcategory as string)
      ))
    : [];

  // Filter
  const filtered = sets.filter((s) => {
    const matchCat = !selectedCat || s.category === selectedCat;
    const matchSub = !selectedSub || s.subcategory === selectedSub;
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSub && matchSearch;
  });

  const handleSelectCat = (cat: string) => {
    if (selectedCat === cat) {
      setSelectedCat(null);
      setSelectedSub(null);
    } else {
      setSelectedCat(cat);
      setSelectedSub(null);
    }
  };

  const clearFilters = () => {
    setSelectedCat(null);
    setSelectedSub(null);
    setSearch("");
  };

  const hasFilter = selectedCat || selectedSub || search;

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">

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
                <p className="text-xs text-slate-400">{sets.length} ชุด · {sets.reduce((s, e) => s + e._count.questions, 0).toLocaleString()} ข้อ</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => fetchSets(email)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรช
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชุดข้อสอบ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#BD1B0B] focus:ring-1 focus:ring-[#BD1B0B]/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ===== STEP 1: เลือกวิชา ===== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">① เลือกวิชา</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const count = sets.filter((s) => s.category === cat).length;
              const isActive = selectedCat === cat;
              const chipColor = CHIP_COLORS[cat] || "bg-slate-600";
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCat(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    isActive
                      ? `${chipColor} text-white border-transparent shadow-sm`
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {cat}
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== STEP 2: เลือกหมวด (conditional) ===== */}
        {selectedCat && subcategories.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">② เลือกหมวด</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  !selectedSub
                    ? "bg-slate-800 text-white border-transparent"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                ทั้งหมด
              </button>
              {subcategories.map((sub) => {
                const count = sets.filter((s) => s.category === selectedCat && s.subcategory === sub).length;
                const isActive = selectedSub === sub;
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSub(isActive ? null : sub)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-slate-700 text-white border-transparent"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {sub}
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Summary + Clear */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            แสดง <span className="font-black text-slate-800">{filtered.length}</span> ชุด
            {selectedCat && <span className="text-[#BD1B0B] font-bold"> · {selectedCat}</span>}
            {selectedSub && <span className="text-slate-600 font-bold"> › {selectedSub}</span>}
          </p>
          {hasFilter && (
            <button type="button" onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#BD1B0B] font-bold transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
              ล้างตัวกรอง
            </button>
          )}
        </div>

        {/* ===== ExamSet List ===== */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">ไม่พบชุดข้อสอบ</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {filtered.map((set, idx) => (
              <Link
                key={set.id}
                href={`/admin/questions/${set.id}`}
                className={`flex items-center justify-between px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition-colors group ${
                  idx !== filtered.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 text-xs font-black text-slate-500">
                    {set.id}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{set.title}</p>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {!selectedCat && (
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[set.category] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                          {set.category}
                        </span>
                      )}
                      {set.subcategory && (
                        <span className="text-xs text-slate-400">{set.subcategory}</span>
                      )}
                      <span className="text-xs text-slate-400">{set._count.questions} ข้อ</span>
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
        )}

      </div>
    </div>
  );
}
