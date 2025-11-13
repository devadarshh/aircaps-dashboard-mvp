import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    include: { file: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const formatted = analyses.map((a) => ({
    id: a.id,
    title: a.title || a.file.name,
    date: a.createdAt.toISOString().split("T")[0],
    tone: a.tone || "Neutral",
    status: a.file.status === "COMPLETED" ? "ready" : "processing",
    actionItems: Array.isArray(a.todos) ? a.todos.length : 0,
  }));

  return NextResponse.json({ conversations: formatted });
}
