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
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      console.warn(" Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.email;

    const body = (await req.json()) as AnalyzeRequest;
    const { fileId, conversationText } = body;

    if (!conversationText || !fileId) {
      console.error("❌ Missing required fields:", {
        fileId,
        conversationText,
      });
      return NextResponse.json(
        { error: "Missing fileId or conversationText" },
        { status: 400 }
      );
    }

    const hfResponse = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: conversationText,
    });

    const queryEmbedding = Array.isArray(hfResponse[0])
      ? hfResponse[0]
      : hfResponse.flat();

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 384) {
      console.error(
        "❌ Invalid embedding shape. Expected 384 dims, got:",
        queryEmbedding.length
      );
      throw new Error("Invalid embedding format");
    }

    const searchPayload = {
      vector: queryEmbedding as number[],
      limit: 5,
      with_payload: true,
      filter: {
        must: [
          {
            key: "fileId",
            match: { any: [fileId] },
          },
        ],
      },
    };

    const searchResult = await qdrantClient.search(
      COLLECTION_NAME,
      searchPayload
    );

    if (!searchResult.length) {
      console.warn(" No matching chunks found in Qdrant for fileId:", fileId);
      return NextResponse.json(
        { error: "No matching chunks found in Qdrant" },
        { status: 404 }
      );
    }

    const context = searchResult
      .map((r, i) => {
        const payload = r.payload;
        return `---\nChunk ${i + 1}\nFile: ${payload?.fileId}\nContent: ${
          payload?.content || ""
        }\n---`;
      })
      .join("\n\n")
      .slice(0, 3000);

    console.log("🤖 Starting Gemini model response stream...");

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const model = google("gemini-2.5-flash");

        const finalPrompt = PROMPT.replace("{context}", context).replace(
          "{conversationText}",
          conversationText
        );

        console.log("📜 Final LLM prompt length:", finalPrompt.length);

        const result = streamText({
          model,
          prompt: finalPrompt,
          temperature: 0.3,
          experimental_transform: smoothStream(),
        });

        writer.merge(result.toUIMessageStream());

        const fullText = await result.text;
        console.log("✅ [Gemini Final Response]:", fullText);

        if (fullText) {
          console.log("💾 Saving LLM response to Prisma...");
          await prisma.analysis.create({
            data: {
              fileId,
              userId,
              summary: fullText,
            },
          });
          console.log("✅ Response saved successfully.");
        }
      },
    });

    console.log("✅ Returning streamed response to client.");
    return createUIMessageStreamResponse({ stream });
  } catch (err: any) {
    console.error("❌ RAG Analysis Error:", err);
    let detailedError = "No response data from Qdrant.";
    if (err.response?.data) {
      detailedError = JSON.stringify(err.response.data, null, 2);
    } else if (err.data) {
      detailedError = JSON.stringify(err.data, null, 2);
    }

    console.error("🧾 Qdrant Error Response:", detailedError);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
