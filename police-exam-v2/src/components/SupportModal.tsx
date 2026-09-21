"use client";

import { useState } from "react";
import { X, Send, MessageSquare, ChevronDown } from "lucide-react";

const TICKET_TYPES = [
  { value: "แจ้งปัญหา", label: "🐛 แจ้งปัญหา / บัค" },
  { value: "ขอคุณสมบัติ", label: "💡 ขอคุณสมบัติใหม่" },
  { value: "แจ้งข้อสอบผิด", label: "📝 แจ้งข้อสอบผิด" },
  { value: "ขอ Premium", label: "⭐ สอบถามเรื่อง Premium" },
  { value: "อื่นๆ", label: "📬 อื่นๆ" },
];

interface Props {
  email: string;
  onClose: () => void;
}

export default function SupportModal({ email, onClose }: Props) {
  const [type, setType] = useState(TICKET_TYPES[0].value);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("กรุณากรอกข้อความ");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up sm:animate-none">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5 text-[#BD1B0B]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">ร้องขอ / แจ้งเรื่อง</p>
              <p className="text-xs text-slate-400 font-medium">ส่งตรงถึงแอดมิน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Send className="w-7 h-7 text-emerald-500" />
              </div>
              <p className="text-base font-black text-slate-900 mb-1">ส่งเรียบร้อยแล้ว!</p>
              <p className="text-xs text-slate-500">แอดมินจะรับทราบและดำเนินการโดยเร็ว</p>
              <button
                onClick={onClose}
                className="mt-5 w-full py-3 bg-slate-900 text-white text-xs font-black rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors"
              >
                ปิด
              </button>
            </div>
          ) : (
            <>
              {/* Type selector */}
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1.5">ประเภทเรื่อง</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#BD1B0B] focus:ring-1 focus:ring-[#BD1B0B]/20 cursor-pointer pr-10"
                  >
                    {TICKET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-black text-slate-600 block mb-1.5">
                  รายละเอียด <span className="text-[#BD1B0B]">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="อธิบายรายละเอียด เช่น ข้อสอบหมายเลข... เฉลยผิดเพราะ..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#BD1B0B] focus:ring-1 focus:ring-[#BD1B0B]/20 resize-none"
                />
                {error && <p className="text-xs text-[#BD1B0B] font-bold mt-1">{error}</p>}
              </div>

              <button
                onClick={handleSubmit}
                disabled={sending}
                className="w-full py-3.5 bg-[#BD1B0B] hover:bg-[#A81507] disabled:opacity-60 text-white text-sm font-black rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-950/20"
              >
                {sending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "กำลังส่ง..." : "ส่งให้แอดมิน"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
