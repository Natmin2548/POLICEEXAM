"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { Footer } from "./Footer";
import { LoginModal } from "./LoginModal";

import { supabase } from "@/lib/supabaseClient";

export const LandingPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenLogin = () => setIsLoginModalOpen(true);
  const handleCloseLogin = () => setIsLoginModalOpen(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const origin = typeof window !== "undefined" ? window.location.origin : "https://police-exam-th.vercel.app";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Google sign-in error:", error.message);
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ: " + error.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Sign-in unexpected error:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-police-100 selection:text-police-900">
      {/* Top Sticky Navbar */}
      <Navbar onOpenLogin={handleOpenLogin} />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection onOpenLogin={handleGoogleLogin} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLogin}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};
