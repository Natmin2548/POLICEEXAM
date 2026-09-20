import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseChapter(title: string) {
  // e.g. "แบบทดสอบภาษาไทย: บทที่ 1 วิเคราะห์บทความ (ชุดที่ 1)"
  // e.g. "แบบทดสอบระเบียบสารบรรณ (๒๕๒๖): บทที่ 1 บทนำและนิยาม (ชุดที่ 1)"
  // e.g. "แบบทดสอบสารบรรณตำรวจ ลักษณะที่ ๕๔: บทที่ ๑: บทนำ และขอบเขตงานสารบรรณตำรวจ (ชุดที่ 1)"
  const match = title.match(/บทที่\s*([0-9๑-๙]+(?:-[0-9๑-๙]+)?)\s*[:\s]*([^(]+)/);
  if (match) {
    const rawNum = match[1];
    const name = match[2].trim().replace(/^:\s*/, "");
    return { num: rawNum, name };
  }
  return { num: "0", name: title };
}

export async function GET() {
  try {
    const sets = await prisma.examSet.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        _count: { select: { questions: true } },
      },
      orderBy: [{ category: "asc" }, { id: "asc" }],
    });

    const categoryMeta: Record<
      string,
      {
        displayName: string;
        iconType: string;
        iconColor: string;
        badgeBg: string;
        badgeText: string;
      }
    > = {
      ภาษาไทย: {
        displayName: "ภาษาไทย",
        iconType: "text",
        iconColor: "text-red-600",
        badgeBg: "bg-rose-50",
        badgeText: "text-rose-600",
      },
      ทั่วไป: {
        displayName: "ความสามารถทั่วไป",
        iconType: "brain",
        iconColor: "text-purple-600",
        badgeBg: "bg-purple-50",
        badgeText: "text-purple-600",
      },
      คอม: {
        displayName: "คอมพิวเตอร์",
        iconType: "laptop",
        iconColor: "text-blue-600",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-600",
      },
      กฏหมาย: {
        displayName: "กฎหมาย",
        iconType: "scale",
        iconColor: "text-amber-600",
        badgeBg: "bg-amber-50",
        badgeText: "text-amber-600",
      },
      สังคม: {
        displayName: "สังคม",
        iconType: "globe",
        iconColor: "text-emerald-600",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-600",
      },
      งานสารบรรณ_๒๕๒๖: {
        displayName: "งานสารบรรณ",
        iconType: "file",
        iconColor: "text-orange-600",
        badgeBg: "bg-orange-50",
        badgeText: "text-orange-600",
      },
      สารบรรณตำรวจ_๕๔: {
        displayName: "ลักษณะที่ 54",
        iconType: "clipboard",
        iconColor: "text-rose-600",
        badgeBg: "bg-pink-50",
        badgeText: "text-pink-600",
      },
      ภาษาอังกฤษ: {
        displayName: "ภาษาอังกฤษ",
        iconType: "text_en",
        iconColor: "text-cyan-600",
        badgeBg: "bg-cyan-50",
        badgeText: "text-cyan-600",
      },
    };

    // Category sorting order to match user's screenshot 3
    const sortOrder = [
      "ภาษาไทย",
      "ทั่วไป",
      "คอม",
      "กฏหมาย",
      "สังคม",
      "งานสารบรรณ_๒๕๒๖",
      "สารบรรณตำรวจ_๕๔",
      "ภาษาอังกฤษ",
    ];

    const grouped: Record<
      string,
      {
        categoryKey: string;
        displayName: string;
        iconType: string;
        iconColor: string;
        badgeBg: string;
        badgeText: string;
        totalQuestions: number;
        chaptersMap: Record<
          string,
          {
            num: string;
            name: string;
            totalQuestions: number;
            setIds: number[];
          }
        >;
      }
    > = {};

    sortOrder.forEach((catKey) => {
      const meta = categoryMeta[catKey] || {
        displayName: catKey,
        iconType: "file",
        iconColor: "text-slate-600",
        badgeBg: "bg-slate-50",
        badgeText: "text-slate-600",
      };
      grouped[catKey] = {
        categoryKey: catKey,
        displayName: meta.displayName,
        iconType: meta.iconType,
        iconColor: meta.iconColor,
        badgeBg: meta.badgeBg,
        badgeText: meta.badgeText,
        totalQuestions: 0,
        chaptersMap: {},
      };
    });

    sets.forEach((s) => {
      const catKey = s.category;
      if (!grouped[catKey]) {
        grouped[catKey] = {
          categoryKey: catKey,
          displayName: catKey,
          iconType: "file",
          iconColor: "text-slate-600",
          badgeBg: "bg-slate-50",
          badgeText: "text-slate-600",
          totalQuestions: 0,
          chaptersMap: {},
        };
      }

      const qCount = s._count.questions;
      grouped[catKey].totalQuestions += qCount;

      const ch = parseChapter(s.title);
      const chName = ch.name;
      if (!grouped[catKey].chaptersMap[chName]) {
        grouped[catKey].chaptersMap[chName] = {
          num: ch.num,
          name: chName,
          totalQuestions: 0,
          setIds: [],
        };
      }

      grouped[catKey].chaptersMap[chName].totalQuestions += qCount;
      grouped[catKey].chaptersMap[chName].setIds.push(s.id);
    });

    const result = sortOrder
      .filter((k) => grouped[k] && grouped[k].totalQuestions > 0)
      .map((k) => {
        const item = grouped[k];
        const chaptersList = Object.values(item.chaptersMap);
        return {
          categoryKey: item.categoryKey,
          displayName: item.displayName,
          iconType: item.iconType,
          iconColor: item.iconColor,
          badgeBg: item.badgeBg,
          badgeText: item.badgeText,
          totalQuestions: item.totalQuestions,
          chapterCount: chaptersList.length,
          chapters: chaptersList,
        };
      });

    return NextResponse.json(
      { categories: result },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
