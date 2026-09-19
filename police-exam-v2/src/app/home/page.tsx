import { HomePage } from "@/components/home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "แดชบอร์ดเตรียมสอบ - POLICE EXAM",
  description: "คลังข้อสอบ 6 หมวดวิชา และสนามสอบจำลอง 150 ข้อ",
};

export default function Page() {
  return <HomePage />;
}
