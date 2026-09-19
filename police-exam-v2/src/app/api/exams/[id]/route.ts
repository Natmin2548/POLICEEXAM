import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const setId = parseInt(id, 10);

    if (isNaN(setId)) {
      // If id is not a number (e.g. 'pretest-prabpram' or 'pretest-amnuay')
      const trackName = id.includes("amnuay") ? "สายอำนวยการ" : "สายปราบปราม";
      const examSet = await prisma.examSet.findFirst({
        where: { category: { contains: trackName } },
        include: { questions: { orderBy: { sortOrder: "asc" } } },
      });

      if (examSet) {
        return NextResponse.json({ success: true, data: examSet });
      }

      // Return any available set
      const fallback = await prisma.examSet.findFirst({
        include: { questions: { orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json({ success: true, data: fallback });
    }

    const examSet = await prisma.examSet.findUnique({
      where: { id: setId },
      include: {
        questions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!examSet) {
      return NextResponse.json(
        { success: false, error: "Exam set not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: examSet });
  } catch (error: any) {
    console.error("API /api/exams/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch exam set" },
      { status: 500 }
    );
  }
}
