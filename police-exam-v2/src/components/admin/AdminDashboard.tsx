"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Users,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Search,
  CheckCircle2,
  Lock,
  Radio,
  FileQuestion,
  BarChart3,
  LogOut,
} from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";

type AdminTab = "dashboard" | "users" | "exams" | "reports";

export const AdminDashboard: React.FC = () => {
  const { user, setRole } = useUserStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Mock initial users list for admin management
  const [usersList, setUsersList] = useState([
    {
      id: 1,
      name: "มีน (คุณ)",
      email: "nni893399@gmail.com",
      role: "ADMIN",
      joinedAt: "2026-09-01",
      attempts: 42,
    },
    {
      id: 2,
      name: "สมศักดิ์ มั่นคง",
      email: "somsak.police@gmail.com",
      role: "USER",
      joinedAt: "2026-09-10",
      attempts: 18,
    },
    {
      id: 3,
      name: "กิตติพงษ์ สิทธิชัย",
      email: "kittipong.k@gmail.com",
      role: "USER",
      joinedAt: "2026-09-12",
      attempts: 25,
    },
    {
      id: 4,
      name: "วรัญญา ศรีสุข",
      email: "waranya.s@gmail.com",
      role: "USER",
      joinedAt: "2026-09-15",
      attempts: 9,
    },
  ]);

  const [examCategories, setExamCategories] = useState([
    { id: "th", name: "ภาษาไทย", sets: 14, questions: 420 },
    { id: "general", name: "ความสามารถทั่วไป", sets: 15, questions: 450 },
    { id: "computer", name: "คอมพิวเตอร์และเทคโนโลยี", sets: 14, questions: 420 },
    { id: "law", name: "กฎหมายและระเบียบตำรวจ", sets: 16, questions: 480 },
    { id: "social", name: "สังคม วัฒนธรรม และจริยธรรม", sets: 12, questions: 360 },
    { id: "en", name: "ภาษาอังกฤษ", sets: 15, questions: 450 },
  ]);

  const [dbStats, setDbStats] = useState({
    users: 1,
    examSets: 26,
    questions: 192,
    attempts: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setDbStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));

    fetch("/api/exams")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Aggregate by category
          const categoryMap: Record<string, { sets: number; questions: number }> = {};
          data.data.forEach((item: any) => {
            const cat = item.category || "ทั่วไป";
            if (!categoryMap[cat]) categoryMap[cat] = { sets: 0, questions: 0 };
            categoryMap[cat].sets += 1;
            categoryMap[cat].questions += item._count?.questions || item.totalCount || 10;
          });

          const formatted = Object.entries(categoryMap).map(([name, val], idx) => ({
            id: `cat-${idx}`,
            name,
            sets: val.sets,
            questions: val.questions,
          }));

          if (formatted.length > 0) {
            setExamCategories(formatted);
          }
        }
      })
      .catch((err) => console.error("Error fetching exams:", err));
  }, []);

  const isAdmin = user.role === "ADMIN" || user.role === "OWNER";

  const handleToggleRole = (userId: number) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
          if (userId === user.id) {
            setRole(newRole as "ADMIN" | "USER");
          }
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  // If user is NOT an admin, display Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-6 shadow-2xl">
          <Lock className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          เข้าถึงไม่ได้ (Access Denied)
        </h1>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น บัญชีของคุณ (
          {user.email || user.name}) ไม่มีสิทธิ์เข้าใช้งาน
        </p>
        <div className="flex gap-3">
          <a
            href="/home"
            className="px-6 py-3 rounded-2xl bg-police-800 hover:bg-police-900 text-white font-bold text-sm shadow-lg transition-all"
          >
            กลับสู่หน้าหลัก
          </a>
          <button
            type="button"
            onClick={() => setRole("ADMIN")}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm border border-slate-700 transition-all"
          >
            จำลองสิทธิ์เป็น Admin
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-police-800 flex items-center justify-center text-white shadow-md shadow-red-950/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 font-sans">
                POLICE<span className="text-police-800">EXAM</span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider bg-police-50 text-police-800 border border-police-200 px-2 py-0.5 rounded-md">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Indicator */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>LIVE SERVER</span>
          </div>

          {/* Back to Home Button */}
          <a
            href="/home"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">กลับหน้าแอปหลัก</span>
          </a>
        </div>
      </header>

      {/* Main Admin Container */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-police-800 text-white shadow-md shadow-red-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>ภาพรวม (Dashboard)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "users"
                ? "bg-police-800 text-white shadow-md shadow-red-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>จัดการสมาชิก (Users)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("exams")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "exams"
                ? "bg-police-800 text-white shadow-md shadow-red-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คลังข้อสอบ (Exams)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "reports"
                ? "bg-police-800 text-white shadow-md shadow-red-900/20"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>รายงานข้อสอบผิด (Reports)</span>
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black">
              0
            </span>
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>USERS ONLINE</span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    1
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  สมาชิกใช้งานแบบ Real-time
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-slate-500 font-bold text-xs mb-2 uppercase">
                    TOTAL REGISTERED
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {dbStats.users}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  ผู้ใช้งานทั้งหมดในระบบ
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-slate-500 font-bold text-xs mb-2 uppercase">
                    EXAM SETS
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {dbStats.examSets}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  ชุดข้อสอบพร้อมสอบจริง
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-slate-500 font-bold text-xs mb-2 uppercase">
                    TOTAL QUESTIONS
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight text-police-800">
                    {dbStats.questions.toLocaleString()}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 font-medium">
                  ข้อสอบมาตรฐานในฐานข้อมูล
                </div>
              </div>
            </div>

            {/* Subject Breakdown Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-police-800" />
                <span>สรุปจำนวนข้อสอบแยกตาม 6 หมวดวิชา</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {examCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {cat.sets} ชุดข้อสอบ
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-police-800">
                        {cat.questions}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">ข้อ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users Management */}
        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  รายชื่อผู้ใช้งานในระบบ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  สามารถค้นหาและปรับเปลี่ยนสิทธิ์ (ADMIN / USER) ได้ทันที
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาด้วยชื่อ หรืออีเมล..."
                  className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-police-800 transition-colors"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider">
                    <th className="p-3.5">ผู้ใช้งาน</th>
                    <th className="p-3.5">อีเมล</th>
                    <th className="p-3.5">สิทธิ์ (Role)</th>
                    <th className="p-3.5 text-center">จำนวนครั้งที่สอบ</th>
                    <th className="p-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        {u.name}
                      </td>
                      <td className="p-3.5 text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role === "ADMIN" ? "🛡️ ADMIN" : "👤 MEMBER"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {u.attempts} ครั้ง
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRole(u.id)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-police-800 text-xs font-bold text-slate-700 hover:text-police-800 bg-white transition-all cursor-pointer"
                        >
                          {u.role === "ADMIN" ? "ปลดแอดมิน" : "ตั้งเป็น Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Exams Management */}
        {activeTab === "exams" && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900">
              คลังข้อสอบและชุดข้อสอบทั้งหมด
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-police-800/40 transition-all flex flex-col justify-between bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">
                        {cat.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        รหัสหมวด: {cat.id}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-police-50 text-police-800 font-black text-xs">
                      {cat.questions} ข้อ
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-bold">
                      {cat.sets} ชุดฝึกฝน
                    </span>
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      พร้อมใช้งาน
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Reports */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              ไม่มีรายงานข้อสอบผิดที่ค้างอยู่
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              เมื่อมีผู้เข้าสอบกดรายงานข้อสอบหรือเฉลยที่ไม่ถูกต้อง รายการจะแสดงขึ้นที่นี่เพื่อให้ผู้ดูแลระบบตรวจสอบ
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
