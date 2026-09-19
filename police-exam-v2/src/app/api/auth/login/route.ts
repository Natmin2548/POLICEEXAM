import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, role } = body;

    const userEmail = (email || "nni893399@gmail.com").trim().toLowerCase();
    const userName = name || (userEmail.includes("nni893399") ? "มีน" : "ผู้เข้าสอบ");

    // Find or create user in Prisma DB
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: userEmail.split("@")[0] + "_" + Math.floor(Math.random() * 1000),
          email: userEmail,
          password: "hashed_default_password",
          fullName: userName,
          role: role || (userEmail === "nni893399@gmail.com" ? "ADMIN" : "USER"),
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName || user.username,
        email: user.email,
        role: user.role,
        isLoggedIn: true,
      },
    });
  } catch (error: any) {
    console.error("API /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
