import { google } from "@ai-sdk/google";
import { streamText, smoothStream } from "ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hf } from "@/lib/hfClient";
import { COLLECTION_NAME, qdrantClient } from "@/lib/qdrant";
import { JsonOutputParser } from "@langchain/core/output_parsers";

interface AnalyzeRequest {
  fileId: string;
  conversationText: string;
  title?: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const {
      fileId,
      conversationText,
      title: userProvidedTitle,
    } = (await req.json()) as AnalyzeRequest;

    if (!conversationText || !fileId)
      return NextResponse.json(
        { error: "Missing fileId or conversationText" },
        { status: 400 }
      );

    // ✅ Step 1: Generate embeddings
    const hfResponse = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: conversationText,
    });
    const queryEmbedding = Array.isArray(hfResponse[0])
      ? hfResponse[0]
      : hfResponse.flat();

    if (!Array.isArray(queryEmbedding) || queryEmbedding.length !== 384)
      throw new Error("Invalid embedding format");

    // ✅ Step 2: Search context from Qdrant
    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryEmbedding as number[],
      limit: 5,
      with_payload: true,
      filter: { must: [{ key: "fileId", match: { any: [fileId] } }] },
    });

    if (!searchResult.length)
      return NextResponse.json(
        { error: "No matching chunks found in Qdrant" },
        { status: 404 }
      );

    const context = searchResult
      .map(
        (r, i) =>
          `---\nChunk ${i + 1}\nFile: ${r.payload?.fileId}\nContent: ${
            r.payload?.content || ""
          }\n---`
      )
      .join("\n\n")
      .slice(0, 3000);

    // ✅ Step 3: Prompt LLM to return JSON strictly
    const parser = new JsonOutputParser();
    const formatInstructions = parser.getFormatInstructions();

    const PROMPT = `
You are an expert conversation coach with 50+ years of experience. My name is Adarsh. 
Analyze the following conversation chunks and return a JSON object **strictly in the format below**:

{
  "title": "Short summary of the conversation",
  "summary": "Detailed summary",
  "todos": ["Follow up on X", "Schedule next call"],
  "talkListenRatio": 0.62,
  "talkTimeDist": [
    { "speaker": "Adarsh", "durationSec": 340 },
    { "speaker": "Coach", "durationSec": 210 }
  ],
  "speakingMetrics": {
    "paceOverTime": [
      { "minute": 1, "paceWPM": 140 },
      { "minute": 2, "paceWPM": 155 }
    ],
    "fillerWords": [
      { "word": "um", "count": 12 },
      { "word": "like", "count": 8 }
    ],
    "longestMonologueSec": 70
  },
  "sentiments": [
    { "timestamp": "00:00", "sentiment": "neutral", "score": 0.4 },
    { "timestamp": "01:00", "sentiment": "positive", "score": 0.8 },
    { "timestamp": "02:00", "sentiment": "negative", "score": 0.3 }
  ]
}

Conversation Context:
${context}

Conversation to Analyze:
${conversationText}
`;

    const model = google("gemini-2.5-flash");

    const result = streamText({
      model,
      prompt: PROMPT,
      temperature: 0.3,
      experimental_transform: smoothStream(),
    });

    const llmOutput = await result.text;

    // ✅ Step 4: Parse LLM JSON
    let parsedData;
    try {
      parsedData = await parser.parse(llmOutput);
    } catch (err) {
      console.warn("⚠️ Failed to parse LLM output as JSON", err);
      parsedData = { raw: llmOutput };
    }

    const finalTitle =
      userProvidedTitle?.trim() || parsedData.title || "Untitled Conversation";

    // ✅ Step 5: Save analysis
    const savedAnalysis = await prisma.analysis.create({
      data: {
        fileId,
        userId: user.id,
        title: finalTitle,
        summary: parsedData.summary,
        todos: parsedData.todos,
        talkListenRatio: parsedData.talkListenRatio,
        talkTimeDist: parsedData.talkTimeDist,
        speakingMetrics: parsedData.speakingMetrics,
        sentiments: parsedData.sentiments,
        rawResponse: parsedData,
      },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      analysis: { id: savedAnalysis.id },
    });
  } catch (err: any) {
    console.error("❌ RAG Analysis Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
