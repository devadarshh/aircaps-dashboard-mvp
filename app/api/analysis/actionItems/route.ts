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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { analyses: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const allTodos: { text: string; conversationTitle: string }[] = [];

    user.analyses.forEach((analysis) => {
      const todos = analysis.todos as string[] | null;
      if (todos) {
        todos.forEach((todo) => {
          allTodos.push({
            text: todo,
            conversationTitle: analysis.title || "Untitled",
          });
        });
      }
    });

    return NextResponse.json({ actionItems: allTodos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
