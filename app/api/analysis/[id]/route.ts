import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return NextResponse.json({ error: "Missing Id" }, { status: 400 });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id) {
    return NextResponse.json({ error: "Missing Id" }, { status: 400 });
  }

  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: { file: true },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    // Check ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || analysis.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete from Supabase storage
    if (analysis.file.supabasePath) {
      const { error: storageError } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_NAME!)
        .remove([analysis.file.supabasePath]);

      if (storageError) {
        console.error("Supabase delete error:", storageError);
      }
    }

    // Delete File from Prisma (cascades to Analysis)
    await prisma.file.delete({
      where: { id: analysis.fileId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
