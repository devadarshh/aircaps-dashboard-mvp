import { google } from "@ai-sdk/google";
import {
  createUIMessageStream,
  streamText,
  smoothStream,
  createUIMessageStreamResponse,
} from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hf } from "@/lib/hfClient";
import { COLLECTION_NAME, qdrantClient } from "@/lib/qdrant";

interface AnalyzeRequest {
  fileId: string;
  conversationText: string;
}

const PROMPT = `
You are an expert conversation coach.
Analyze the following conversation chunks (retrieved from the vector database) and provide:

1. Summary
2. Key action items / TODOs
3. Suggestions to improve the conversation style

Conversation Context:
{context}

Conversation to Analyze:
{conversationText}
`;

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Auth check
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;

    // 2️⃣ Parse input
    const body = (await req.json()) as AnalyzeRequest;
    const { fileId, conversationText } = body;

    if (!conversationText || !fileId) {
      return NextResponse.json(
        { error: "Missing fileId or conversationText" },
        { status: 400 }
      );
    }

    // 3️⃣ Generate embedding
    const hfResponse = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: conversationText,
    });

    // Flatten nested array if needed
    const queryEmbedding = Array.isArray(hfResponse[0])
      ? hfResponse[0]
      : hfResponse;

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length < 100) {
      console.error("Invalid embedding shape:", queryEmbedding);
      throw new Error("Invalid embedding format");
    }

    // 4️⃣ Search in Qdrant
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 5,
      with_payload: true,
      filter: {
        must: [
          {
            key: "fileId",
            match: { value: fileId }, // ✅ FIXED
          },
        ],
      },
    });

    console.log("🔍 Qdrant Search Result:", searchResult);

    if (!searchResult.length) {
      return NextResponse.json(
        { error: "No matching chunks found in Qdrant" },
        { status: 404 }
      );
    }

    // 5️⃣ Prepare context for LLM
    const context = searchResult
      .map((r, i) => {
        const payload = r.payload;
        return `---\nChunk ${i + 1}\nFile: ${payload?.fileId}\nContent: ${
          payload?.content || ""
        }\n---`;
      })
      .join("\n\n")
      .slice(0, 3000);

    // 6️⃣ Stream Gemini LLM output
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const model = google("gemini-2.5-flash");

        const finalPrompt = PROMPT.replace("{context}", context).replace(
          "{conversationText}",
          conversationText
        );

        const result = streamText({
          model,
          prompt: finalPrompt,
          temperature: 0.3,
          experimental_transform: smoothStream(),
        });

        result.toUIMessageStream().on("data", (chunk) => {
          console.log("[Gemini LLM chunk]:", chunk);
        });

        writer.merge(result.toUIMessageStream());

        const fullText = await result.text();

        console.log("[Gemini Final Response]:", fullText);

        if (fullText) {
          await prisma.analysis.create({
            data: {
              fileId,
              userId,
              //@ts-expect-error
              content: fullText,
            },
          });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (err) {
    console.error("RAG Analysis Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
