
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const analyses = await prisma.analysis.findMany({
      where: {
        userId: user.id,
        talkListenRatio: { not: null },
      },
      select: {
        talkListenRatio: true,
      },
    });

    if (analyses.length === 0) {
      return NextResponse.json({ message: "No data found" });
    }

    let totalTalk = 0;
    let totalListen = 0;

    analyses.forEach((a) => {
      totalTalk += a.talkListenRatio || 0;
      totalListen += 1 - (a.talkListenRatio || 0);
    });

    const avgTalk = totalTalk / analyses.length;
    const avgListen = totalListen / analyses.length;

    const diff = avgListen - avgTalk;
    const message =
      diff > 0
        ? `You are listening ${(diff * 100).toFixed(0)}% more. Great!`
        : `You are talking ${Math.abs(diff * 100).toFixed(0)}% more.`;

    return NextResponse.json({
      avgTalk: (avgTalk * 100).toFixed(0) + "%",
      avgListen: (avgListen * 100).toFixed(0) + "%",
      message,
    });
  } catch (err) {
    console.error("Error calculating talk/listen ratio:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
