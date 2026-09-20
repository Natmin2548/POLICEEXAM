"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // ถ้าติดตั้งแล้วหรืออยู่ใน standalone mode ไม่ต้องแสดง
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) return;

    // ตรวจสอบว่าแสดง banner วันนี้ไปแล้วหรือยัง
    const lastShown = localStorage.getItem("pwa_banner_last_shown");
    const today = new Date().toDateString();
    if (lastShown === today) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
      localStorage.setItem("pwa_banner_last_shown", today);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // สำหรับ iOS Safari
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        setShow(true);
        localStorage.setItem("pwa_banner_last_shown", today);
      }, 2000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 animate-slide-up">
      <div className="max-w-lg mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/60 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#BD1B0B] to-red-400 w-full" />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-[#BD1B0B]/20 border border-[#BD1B0B]/30 flex items-center justify-center shrink-0">
              <img src="/icon-192.png" alt="POLICE EXAM" className="w-8 h-8 rounded-lg object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white leading-snug">
                ติดตั้ง POLICE EXAM บนมือถือ
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                {isIOS
                  ? 'กด Share → "Add to Home Screen" เพื่อติดตั้งแอพ'
                  : "ติดตั้งฟรี! เปิดได้เหมือนแอพ ใช้งานได้ทันที ไม่ต้องเปิดบราวเซอร์"}
              </p>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Buttons */}
          {!isIOS && deferredPrompt && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-600 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors cursor-pointer"
              >
                ไม่ตอนนี้
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#BD1B0B] hover:bg-[#A81507] text-white text-xs font-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-950/30"
              >
                <Download className="w-3.5 h-3.5" />
                ติดตั้งเลย
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
