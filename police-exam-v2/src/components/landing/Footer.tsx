"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-extrabold text-slate-800">
          POLICE<span className="text-police-800">EXAM</span>
        </span>
        <p>© 2026 POLICE EXAM. เพื่อการศึกษาและเตรียมสอบนายสิบตำรวจ.</p>
      </div>
    </footer>
  );
};
