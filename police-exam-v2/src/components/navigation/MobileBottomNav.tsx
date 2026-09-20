"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookMarked, Trophy } from "lucide-react";

export const MobileBottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "หน้าหลัก",
      href: "/home",
      icon: Home,
      isActive: pathname === "/home" || pathname === "/",
    },
    {
      label: "คลัง",
      href: "/archive",
      icon: BookMarked,
      isActive: pathname === "/archive",
    },
    {
      label: "อันดับ",
      href: "/rank",
      icon: Trophy,
      isActive: pathname === "/rank",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 shadow-lg shadow-slate-900/5 flex items-center justify-around lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all py-1 px-4 rounded-xl cursor-pointer ${
              item.isActive
                ? "text-[#BD1B0B] font-black"
                : "text-slate-400 hover:text-slate-600 font-bold"
            }`}
          >
            <Icon className={`w-5 h-5 ${item.isActive ? "stroke-[2.5]" : "stroke-2"}`} />
            <span className="text-[11px] leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
