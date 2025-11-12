import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Queue } from "bullmq";

const fileQueue = new Queue("file-upload-queue");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No File Uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileId = randomUUID();
    const ext = file.name.split(".").pop();
    const path = `user_uploads/${session.user.email}/${fileId}.${ext}`;

    const { data: uploadData, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET_NAME!)
      .upload(path, buffer, {
        contentType: file.type || "text/plain",
        upsert: false,
      });

    if (error || !uploadData) {
      console.error("Supabase upload error:", error);
      return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dbFile = await prisma.file.create({
      data: {
        name: file.name,
        fileType: file.type || "text/plain",
        size: file.size,
        supabaseFileId: fileId,
        supabasePath: uploadData.path,
        userId: user.id,
      },
    });

    await fileQueue.add("file-ready", { fileId: dbFile.id });

    return NextResponse.json({ success: true, file: dbFile });
  } catch (err) {
    console.error("Upload error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
