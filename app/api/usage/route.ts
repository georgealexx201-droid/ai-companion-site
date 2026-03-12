import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const FREE_DAILY_LIMIT = 20;

export async function GET() {
  try {
    const session = await auth();

    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json({
        used: 0,
        limit: FREE_DAILY_LIMIT,
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        isPremium: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        used: 0,
        limit: FREE_DAILY_LIMIT,
      });
    }

    if (user.isPremium) {
      return NextResponse.json({
        used: 0,
        limit: "unlimited",
      });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const used = await prisma.message.count({
      where: {
        role: "user",
        chat: {
          userId: user.id,
        },
        createdAt: {
          gte: startOfDay,
        },
      },
    });

    return NextResponse.json({
      used,
      limit: FREE_DAILY_LIMIT,
    });
  } catch (error) {
    console.error("Usage API error:", error);

    return NextResponse.json(
      {
        used: 0,
        limit: FREE_DAILY_LIMIT,
      },
      { status: 500 }
    );
  }
}