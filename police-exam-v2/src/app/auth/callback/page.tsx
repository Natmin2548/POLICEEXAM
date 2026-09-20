"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Check for errors in search or hash
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.startsWith("#")
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);

        const errorDesc =
          searchParams.get("error_description") ||
          hashParams.get("error_description") ||
          searchParams.get("error") ||
          hashParams.get("error");

        if (errorDesc) {
          console.error("OAuth Error:", errorDesc);
          setErrorMessage(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
          return;
        }

        // 2. If access_token & refresh_token are in hash (Implicit Flow)
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("setSession error:", error);
            setErrorMessage(error.message);
            return;
          }

          if (data?.session) {
            window.location.replace("/home");
            return;
          }
        }

        // 3. If code is in search query (PKCE Flow)
        const code = searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("exchangeCodeForSession error:", error);
            setErrorMessage(error.message);
            return;
          }

          if (data?.session) {
            window.location.replace("/home");
            return;
          }
        }

        // 4. Check existing session
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          window.location.replace("/home");
          return;
        }

        // Listen for onAuthStateChange
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            window.location.replace("/home");
          }
        });

        // Timeout fallback
        setTimeout(() => {
          supabase.auth.getSession().then(({ data }) => {
            if (data?.session) {
              window.location.replace("/home");
            } else {
              setErrorMessage("ไม่สามารถดึงข้อมูลการเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
            }
          });
        }, 5000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("Unexpected callback error:", err);
        setErrorMessage(err?.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
    };

    processAuth();
  }, []);

  if (errorMessage) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-[#BD1B0B] flex items-center justify-center font-bold text-xl mb-4">
          !
        </div>
        <h2 className="text-lg font-black text-slate-900 mb-2">เข้าสู่ระบบไม่สำเร็จ</h2>
        <p className="text-sm text-red-600 max-w-md mb-6">{errorMessage}</p>
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="bg-[#BD1B0B] hover:bg-red-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          กลับสู่หน้าแรก
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-10 h-10 rounded-full border-2 border-red-200 border-t-[#BD1B0B] animate-spin mb-4" />
      <p className="text-sm text-slate-600 font-bold">กำลังเข้าสู่ระบบ...</p>
    </div>
  );
}
