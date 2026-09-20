"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExamReviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/exam/session?mode=review_incorrect&title=${encodeURIComponent("ฝึกแก้ข้อสอบที่เคยตอบผิด")}`
    );
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center font-sans">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#BD1B0B] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-bold text-slate-600">กำลังเตรียมข้อสอบที่เคยตอบผิด...</p>
      </div>
    </div>
  );
}
