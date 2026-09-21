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

// PUT /api/admin/questions/[id]  → update a question
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { email, questionText, choice1, choice2, choice3, choice4, correctAnswer, explanation } =
    await req.json();

  if (!(await verifyAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const updated = await prisma.question.update({
    where: { id: parseInt(id) },
    data: {
      questionText,
      choice1,
      choice2,
      choice3,
      choice4,
      correctAnswer: parseInt(correctAnswer),
      explanation: explanation || null,
    },
  });

  return NextResponse.json({ success: true, question: updated });
}

// DELETE /api/admin/questions/[id]  → delete a question
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const email = req.nextUrl.searchParams.get("email");
  if (!(await verifyAdmin(email))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.question.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
