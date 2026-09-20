"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Shield,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import { LeaderboardTab } from "@/components/home/LeaderboardTab";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";

export default function RankPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userRole, setUserRole] = useState<string>("USER");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/landing");
        return;
      }

      setUser(session.user);

      // Fetch user role
      if (session.user.email) {
        try {
          const res = await fetch(`/api/user/stats?email=${encodeURIComponent(session.user.email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.role) {
              setUserRole(data.role);
            }
          }
        } catch (err) {
          console.error("Failed to load user role:", err);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/landing");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "ผู้เข้าสอบ";

  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "สวัสดีตอนเช้า" : hour < 18 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนค่ำ";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex flex-col items-center justify-center font-sans">
        <div className="w-10 h-10 border-3 border-[#BD1B0B] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-bold">กำลังโหลดข้อมูลอันดับ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-slate-900 pb-28 lg:pb-12 font-sans selection:bg-red-100 selection:text-red-900">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#FBFBFB]/90 backdrop-blur-md border-b border-slate-100/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#BD1B0B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900">
              POLICE<span className="text-[#BD1B0B]">EXAM</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (Center) */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/50">
            <Link
              href="/home"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/archive"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900"
            >
              คลังข้อสอบ
            </Link>
            <Link
              href="/rank"
              className="px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white text-[#BD1B0B] shadow-xs"
            >
              จัดอันดับ
            </Link>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#BD1B0B] hover:border-red-200 transition-colors shadow-2xs cursor-pointer"
              aria-label="แจ้งเตือน"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex flex-col text-right">
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  {greeting}
                </span>
                <span className="text-sm font-black text-slate-900 leading-tight truncate max-w-[150px] sm:max-w-[240px]">
                  {displayName}
                </span>
              </div>

              {/* Avatar Button & Popup Panel */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((prev) => !prev)}
                  title="โปรไฟล์และเมนูจัดการ"
                  className="w-10 h-10 rounded-full ring-2 ring-slate-100 overflow-hidden bg-slate-200 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0288D1] flex items-center justify-center text-white text-sm font-bold">
                      {(displayName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>

                {/* Profile Popup Menu */}
                {showProfileMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileMenu(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-64 sm:w-72 bg-white rounded-3xl p-5 shadow-2xl border border-slate-100/90 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="mb-3 px-1">
                        <h4 className="text-base font-black text-slate-900 leading-tight">
                          {displayName}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                          {user?.email || ""}
                        </p>
                      </div>

                      <div className="h-px bg-slate-100 my-2.5" />

                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            alert("ไม่มีการแจ้งเตือนใหม่ในขณะนี้");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left"
                        >
                          <Bell className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>การแจ้งเตือน</span>
                        </button>

                        {userRole === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-red-50/60 text-[#BD1B0B] text-xs sm:text-sm font-black transition-colors cursor-pointer"
                          >
                            <Shield className="w-4 h-4 text-[#BD1B0B] shrink-0" />
                            <span>จัดการระบบ (Admin Panel)</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-slate-700 shrink-0" />
                          <span>ออกจากระบบ</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6">
        <LeaderboardTab
          userEmail={user?.email}
          displayName={displayName}
          avatarUrl={avatarUrl}
        />
      </main>

      {/* Mobile Full-Width Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}
