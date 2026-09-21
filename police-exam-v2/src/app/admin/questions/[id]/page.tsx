"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Question {
  id: number;
  questionText: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  correctAnswer: number;
  explanation: string | null;
  sortOrder: number;
  difficulty: string;
  topic: string | null;
}

interface ExamSetInfo {
  id: number;
  title: string;
  category: string;
  totalCount: number;
}

const choiceLetters = ["ก", "ข", "ค", "ง"];

export default function AdminQuestionsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examSetId = params.id as string;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [examSet, setExamSet] = useState<ExamSetInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  // Edit modal state
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuestions = useCallback(async (userEmail: string, pg: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/exam-sets/${examSetId}?email=${encodeURIComponent(userEmail)}&page=${pg}`
      );
      if (res.status === 403) { router.replace("/home"); return; }
      if (!res.ok) throw new Error("โหลดข้อมูลไม่ได้");
      const data = await res.json();
      setExamSet(data.examSet);
      setQuestions(data.questions);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [examSetId, router]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.email) { router.replace("/home"); return; }
      setEmail(session.user.email);
      fetchQuestions(session.user.email, 1);
    });
  }, []);

  const handleSave = async () => {
    if (!editQ) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`/api/admin/questions/${editQ.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          questionText: editQ.questionText,
          choice1: editQ.choice1,
          choice2: editQ.choice2,
          choice3: editQ.choice3,
          choice4: editQ.choice4,
          correctAnswer: editQ.correctAnswer,
          explanation: editQ.explanation,
        }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      setSaveMsg("บันทึกสำเร็จ ✓");
      // Update local state
      setQuestions((prev) =>
        prev.map((q) => (q.id === editQ.id ? { ...q, ...editQ } : q))
      );
      setTimeout(() => { setEditQ(null); setSaveMsg(""); }, 800);
    } catch (err: any) {
      setSaveMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("ลบไม่สำเร็จ");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setTotal((prev) => prev - 1);
      setDeleteId(null);
    } catch {
      alert("ลบไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / 20);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-3 border-red-200 border-t-[#BD1B0B] animate-spin" />
      </div>
    );
  }

  if (error || !examSet) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <p className="text-sm font-black text-slate-900 mb-4">{error || "ไม่พบชุดข้อสอบ"}</p>
        <Link href="/admin/questions" className="py-2.5 px-6 bg-[#BD1B0B] text-white text-xs font-black rounded-xl">กลับ</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link href="/admin/questions" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#BD1B0B] text-xs font-bold mb-2 group transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              รายการชุดข้อสอบ
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#BD1B0B] flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{examSet.title}</h1>
                <p className="text-xs text-slate-400">{examSet.category} · {total} ข้อ</p>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => fetchQuestions(email, page)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-xs cursor-pointer self-start sm:self-auto">
            <RefreshCw className="w-3.5 h-3.5" />
            รีเฟรช
          </button>
        </div>

        {/* Pagination info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>แสดง {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} จาก {total} ข้อ</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => { setPage(p => p - 1); fetchQuestions(email, page - 1); }}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold">{page}/{totalPages}</span>
            <button type="button" onClick={() => { setPage(p => p + 1); fetchQuestions(email, page + 1); }}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                    {((page - 1) * 20) + idx + 1}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    q.difficulty === "EASY" ? "bg-emerald-50 text-emerald-700" :
                    q.difficulty === "HARD" ? "bg-red-50 text-red-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {q.difficulty === "EASY" ? "ง่าย" : q.difficulty === "HARD" ? "ยาก" : "ปานกลาง"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => setEditQ({ ...q })}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-blue-50 hover:border-blue-200 text-slate-400 hover:text-blue-600 cursor-pointer transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setDeleteId(q.id)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-400 hover:text-red-600 cursor-pointer transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm font-bold text-slate-900 leading-relaxed mb-3 whitespace-pre-line">
                {q.questionText}
              </p>

              {/* Choices */}
              <div className="space-y-1.5">
                {[q.choice1, q.choice2, q.choice3, q.choice4].map((c, ci) => (
                  <div key={ci} className={`flex items-center gap-2.5 text-xs px-3 py-2 rounded-xl border ${
                    q.correctAnswer === ci + 1
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900 font-bold"
                      : "bg-slate-50 border-slate-100 text-slate-600"
                  }`}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black bg-white border border-current/20 shrink-0">
                      {choiceLetters[ci]}
                    </span>
                    <span className="flex-1">{c}</span>
                    {q.correctAnswer === ci + 1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="mt-3 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">คำอธิบาย: </span>{q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button type="button" onClick={() => { setPage(p => p - 1); fetchQuestions(email, page - 1); }}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 cursor-pointer">
              ← ก่อนหน้า
            </button>
            <span className="text-xs text-slate-500 font-bold">{page} / {totalPages}</span>
            <button type="button" onClick={() => { setPage(p => p + 1); fetchQuestions(email, page + 1); }}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 cursor-pointer">
              ถัดไป →
            </button>
          </div>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {editQ && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
              <p className="text-sm font-black text-slate-900">แก้ไขข้อสอบ #{editQ.id}</p>
              <button onClick={() => setEditQ(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Question Text */}
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1.5">โจทย์</label>
                <textarea
                  value={editQ.questionText}
                  onChange={(e) => setEditQ({ ...editQ, questionText: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#BD1B0B] resize-none"
                />
              </div>

              {/* Choices */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-600 block">ตัวเลือก</label>
                {(["choice1", "choice2", "choice3", "choice4"] as const).map((key, ci) => (
                  <div key={ci} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditQ({ ...editQ, correctAnswer: ci + 1 })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border shrink-0 cursor-pointer transition-all ${
                        editQ.correctAnswer === ci + 1
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-white text-slate-500 border-slate-200 hover:border-emerald-400"
                      }`}
                    >
                      {choiceLetters[ci]}
                    </button>
                    <input
                      type="text"
                      value={editQ[key]}
                      onChange={(e) => setEditQ({ ...editQ, [key]: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#BD1B0B]"
                    />
                  </div>
                ))}
                <p className="text-xs text-slate-400">กดตัวอักษร ก/ข/ค/ง เพื่อตั้งเป็นคำตอบที่ถูก</p>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1.5">คำอธิบาย (ไม่บังคับ)</label>
                <textarea
                  value={editQ.explanation || ""}
                  onChange={(e) => setEditQ({ ...editQ, explanation: e.target.value })}
                  rows={3}
                  placeholder="คำอธิบายเฉลย..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#BD1B0B] resize-none placeholder:text-slate-400"
                />
              </div>

              {saveMsg && (
                <p className={`text-xs font-bold ${saveMsg.includes("✓") ? "text-emerald-600" : "text-red-600"}`}>
                  {saveMsg}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex gap-2.5 shrink-0">
              <button type="button" onClick={() => setEditQ(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50 cursor-pointer">
                ยกเลิก
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 bg-[#BD1B0B] hover:bg-[#A81507] disabled:opacity-60 text-white text-xs font-black rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
                {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRM ===== */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-[#BD1B0B]" />
            </div>
            <p className="text-sm font-black text-slate-900 mb-1">ลบข้อสอบนี้?</p>
            <p className="text-xs text-slate-500 mb-5">ไม่สามารถกู้คืนได้หลังจากลบแล้ว</p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-2xl hover:bg-slate-50 cursor-pointer">
                ยกเลิก
              </button>
              <button type="button" onClick={() => handleDelete(deleteId!)} disabled={deleting}
                className="flex-1 py-2.5 bg-[#BD1B0B] text-white text-xs font-black rounded-2xl cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                {deleting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {deleting ? "กำลังลบ..." : "ลบเลย"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
