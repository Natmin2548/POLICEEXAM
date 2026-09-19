import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POLICE EXAM - เตรียมพร้อมสู่เครื่องแบบ",
  description: "แพลตฟอร์มเตรียมสอบนายสิบตำรวจที่ครบวงจร ใช้งานฟรี ตะลุยข้อสอบเก่าและใหม่",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#BD1B0B",
};

export default function RootLayout({
  children,
}: ReadInternalProps) {
  return (
    <html lang="th" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-police-100 selection:text-police-900">
        {children}
      </body>
    </html>
  );
}

interface ReadInternalProps {
  children: React.ReactNode;
}
