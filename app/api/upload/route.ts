import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const uploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  type: z.string().min(1),
});

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
    console.log("what is form data", formData);
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No File Uploaded" }, { status: 400 });
    }

    const parsed = uploadSchema.parse({
      name: file.name,
      size: file.size,
      type: file.type || "text/plain",
    });

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
  } catch (err) {
    console.error("Upload error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
