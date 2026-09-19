import { AdminDashboard } from "@/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ระบบจัดการผู้ดูแล - POLICE EXAM Admin Panel",
  description: "ระบบจัดการสมาชิก ชุดข้อสอบ และสถิติรวมของระบบ POLICE EXAM",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
