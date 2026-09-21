import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function verifyAdmin(email: string | null) {
  if (!email) return false;
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET /api/admin/exam-sets?email=...  → list all exam sets
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!(await verifyAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sets = await prisma.examSet.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      subcategory: true,
      totalCount: true,
      isPublic: true,
      status: true,
      createdAt: true,
      _count: { select: { questions: true } },
    },
  });

  return NextResponse.json(sets);
}

// POST /api/admin/exam-sets  → create new ExamSet (optional, future)
