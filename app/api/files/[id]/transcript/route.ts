import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await context.params;
  const fileId = resolvedParams?.id;

  console.log("🔥 Transcript route hit with ID:", fileId);

  if (!fileId) {
    return NextResponse.json({ error: "Invalid or missing file ID" }, { status: 400 });
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .download(file.supabasePath);

    if (error || !data) {
      console.error("Error fetching from supabase:", error);
      return NextResponse.json(
        { error: "Unable to fetch transcript" },
        { status: 500 }
      );
    }

    const text = await data.text();
    return NextResponse.json({ transcript: text });
  } catch (err: any) {
    console.error("💥 Transcript fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: err.message },
      { status: 500 }
    );
  }
}
