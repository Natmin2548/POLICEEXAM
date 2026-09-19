"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { LoginModal } from "./LoginModal";

export const LandingPage: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("login") === "1") {
        setIsLoginModalOpen(true);
      }
    }
  }, []);

  const handleOpenLogin = () => setIsLoginModalOpen(true);
  const handleCloseLogin = () => setIsLoginModalOpen(false);

  const handleGoogleLogin = () => {

    alert("เชื่อมต่อ Google Sign-In ตาม NextAuth.js");
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-police-100 selection:text-police-900">
      {/* Top Sticky Navbar */}
      <Navbar onOpenLogin={handleOpenLogin} />

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection onOpenLogin={handleOpenLogin} />
      </main>

      {/* Google Login Modal Popup */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLogin}
        onGoogleLogin={handleGoogleLogin}
      />
    </div>
  );
};
