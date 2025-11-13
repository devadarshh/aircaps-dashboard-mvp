import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // or your db client
import { getServerSession } from "next-auth"; // if you use next-auth
import { authOptions } from "@/lib/auth"; // optional

export async function GET() {
  try {
    // ✅ If you use auth (optional)
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data from DB
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
