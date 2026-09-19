"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldCheck, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
}) => {
  const { login } = useUserStore();
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePerformLogin = async (userEmail: string, userName: string, role: "ADMIN" | "USER") => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name: userName, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        login(data.user);
        window.location.href = "/home";
      } else {
        alert("เข้าสู่ระบบไม่สำเร็จ: " + (data.error || "เกิดข้อผิดพลาด"));
      }
    } catch (err: any) {
      // Fallback
      login({
        id: role === "ADMIN" ? 1 : 2,
        name: userName,
        email: userEmail,
        role,
        isLoggedIn: true,
      });
      window.location.href = "/home";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดหน้าต่าง"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer touch-manipulation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pt-1">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-tr from-police-800 to-rose-700 flex items-center justify-center shadow-lg shadow-police-800/30 text-white">
            <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
            เข้าสู่ระบบ
          </h2>
          <p className="text-xs text-slate-500 font-normal leading-relaxed px-2">
            กรุณาเข้าสู่ระบบเพื่อดูสถิติจริง บันทึกคะแนนสอบ และเข้าถึงคลังข้อสอบ
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 my-4">
          {/* Quick Login Admin */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              handlePerformLogin("nni893399@gmail.com", "มีน", "ADMIN")
            }
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200 text-police-900 font-bold text-xs transition-all cursor-pointer touch-manipulation group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-police-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🛡️
              </div>
              <div>
                <div className="font-black text-sm text-police-900">
                  เข้าสู่ระบบเป็น แอดมิน (มีน)
                </div>
                <div className="text-[11px] text-police-700 font-medium">
                  nni893399@gmail.com (สิทธิ์ Admin)
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-police-800 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Login Member */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              handlePerformLogin("student@policeexam.com", "ผู้เข้าสอบใหม่", "USER")
            }
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer touch-manipulation group"
          >
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                👤
              </div>
              <div>
                <div className="font-black text-sm text-slate-900">
                  เข้าสู่ระบบเป็น สมาชิกทั่วไป
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  ผู้เข้าสอบใหม่ (สถิติเริ่มจาก 0)
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Divider */}
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-bold text-[10px]">
                หรือ
              </span>
            </div>
          </div>

          {/* Google Sign-in Button */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (onGoogleLogin) onGoogleLogin();
              else handlePerformLogin("google_user@gmail.com", "ผู้ใช้ Google", "USER");
            }}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 active:scale-98 border border-slate-300 text-slate-700 font-semibold px-4 py-3 rounded-xl shadow-xs transition-all cursor-pointer touch-manipulation"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="text-xs sm:text-sm">เข้าสู่ระบบด้วย Google</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
          ระบบจะเชื่อมต่อข้อมูลสถิติและคะแนนสอบจริงของคุณลงฐานข้อมูลโดยอัตโนมัติ
        </p>
      </div>
    </div>
  );
};
