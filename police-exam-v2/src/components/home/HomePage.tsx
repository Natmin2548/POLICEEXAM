"use client";

import React, { useState, useEffect } from "react";
import { BottomNav, HomeTab } from "./BottomNav";
import { HomeView, UserStats } from "./HomeView";
import { BankView } from "./BankView";
import { LeaderboardView } from "./LeaderboardView";
import { PretestTrackSelection } from "./PretestTrackSelection";
import { ImageCompressorModal } from "./ImageCompressorModal";
import { VocabModal } from "./VocabModal";
import { ExamRoom } from "@/components/exam";

import { useUserStore } from "@/stores/useUserStore";

type ExtendedTab = HomeTab | "pretest";

export const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExtendedTab>("home");
  const [isImageCompressorOpen, setIsImageCompressorOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [activeExamTitle, setActiveExamTitle] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | undefined>(undefined);

  const { user, logout } = useUserStore();

  // Authentication Guard: Redirect to /?login=1 if not logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("police_exam_user");
      if (!saved) {
        window.location.href = "/?login=1";
        return;
      }
      try {
        const parsed = JSON.parse(saved);
        if (!parsed || !parsed.isLoggedIn) {
          window.location.href = "/?login=1";
          return;
        }
      } catch {
        window.location.href = "/?login=1";
        return;
      }
      setIsCheckingAuth(false);
    }
  }, []);

  // Fetch real user stats from database
  const loadStats = () => {
    const targetUserId = user?.id || 1;
    fetch(`/api/user/stats?userId=${targetUserId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setUserStats(data.stats);
        }
      })
      .catch((err) => console.error("Error fetching user stats:", err));
  };

  useEffect(() => {
    if (!isCheckingAuth) {
      loadStats();
    }
  }, [isCheckingAuth, user?.id]);

  const handleOpenPretestSelection = () => {
    setActiveTab("pretest");
  };

  const handleSelectTrack = (trackName: string) => {
    setActiveExamTitle(trackName);
  };

  const handleStartSet = (setId: string, title: string) => {
    setActiveExamTitle(title);
  };

  const handleExitExam = () => {
    setActiveExamTitle(null);
    loadStats(); // Re-fetch immediately after exam exit!
  };

  // Loading indicator while verifying authentication session
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-police-800 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">
            กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...
          </span>
        </div>
      </div>
    );
  }

  // If in active exam session, show the Full Exam Engine!
  if (activeExamTitle) {
    return <ExamRoom title={activeExamTitle} onExit={handleExitExam} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-police-100 selection:text-police-900">
      {/* Centered App Container matching exact 1:1 mobile & desktop width */}
      <div className="max-w-[480px] w-full mx-auto px-4 pt-3 flex-1 flex flex-col">
        {/* View 1: หน้าหลัก (Screenshot 1) */}
        {activeTab === "home" && (
          <HomeView
            user={user}
            stats={userStats}
            onOpenPretest={handleOpenPretestSelection}
            onNavigateBank={() => setActiveTab("bank")}
            onNavigateLeaderboard={() => setActiveTab("leaderboard")}
            onOpenImageCompressor={() => setIsImageCompressorOpen(true)}
            onOpenVocabModal={() => setIsVocabModalOpen(true)}
            onLogout={logout}
          />
        )}

        {/* View 2: เลือกสายสอบ Pretest 150 ข้อ & รายวิชา 30 ข้อ (Screenshots 2, 3, 4) */}
        {activeTab === "pretest" && (
          <PretestTrackSelection
            onBack={() => setActiveTab("home")}
            onSelectTrack={handleSelectTrack}
          />
        )}

        {/* View 3: คลังข้อสอบรายบท (Screenshots 2, 4, 5) */}
        {activeTab === "bank" && (
          <BankView
            onBackToHome={() => setActiveTab("home")}
            onStartSet={handleStartSet}
          />
        )}

        {/* View 4: ตารางอันดับ 150 ข้อ (Screenshot 3) */}
        {activeTab === "leaderboard" && (
          <LeaderboardView onStartPretest={handleOpenPretestSelection} />
        )}
      </div>

      {/* Floating Pill Bottom Navigation (Hidden only during pretest sub-selection or exam) */}
      <BottomNav
        activeTab={activeTab === "pretest" ? "home" : activeTab}
        onChangeTab={(tab) => setActiveTab(tab)}
      />

      {/* Interactive Modals */}
      <ImageCompressorModal
        isOpen={isImageCompressorOpen}
        onClose={() => setIsImageCompressorOpen(false)}
      />

      <VocabModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
      />
    </div>
  );
};
