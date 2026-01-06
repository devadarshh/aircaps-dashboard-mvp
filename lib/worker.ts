import { Worker, WorkerOptions } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { Document } from "@langchain/core/documents";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { hf } from "@/lib/hfClient";
import { qdrantClient, COLLECTION_NAME } from "@/lib/qdrant";
import { splitter } from "@/lib/splitter";
import { redis } from "@/lib/redis";
import { ensureCollectionExists } from "@/utils/ensureCollection";


const _redisMarker = redis as unknown as { __isNoop?: true };
const bullConnection: WorkerOptions["connection"] | undefined =
  _redisMarker.__isNoop
    ? undefined
    : (redis as unknown as WorkerOptions["connection"]);

const baseWorkerOptions = {
  concurrency: 10,
  skipVersionCheck: true,
} as const;

const workerOptions: WorkerOptions = bullConnection
  ? ({ ...baseWorkerOptions, connection: bullConnection } as WorkerOptions)
  : (baseWorkerOptions as unknown as WorkerOptions);
interface FileJobData {
  fileId: string;
}

function calculateDurationFormText(transcript: string): number {
  if (!transcript || transcript.length === 0) {
    return 0;
  }
  const wordCount = transcript.split(/\s+/).length;
  const wordsPerMinute = 150;
  const durationMinutes = wordCount / wordsPerMinute;
  return durationMinutes;
}

let worker: Worker<FileJobData> | null = null;

if (bullConnection) {
  worker = new Worker<FileJobData>(
    "file-upload-queue",
    async (job) => {
      console.log(`Processing job ${job.id} with data:`, job.data);
      const { fileId } = job.data;

      try {
        const fileRecord = await prisma.file.findUnique({
          where: { id: fileId },
        });
        if (!fileRecord) {
          throw new Error(`File with ID ${fileId} not found in the database`);
        }

        const { data: fileBlob, error: downloadError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET_NAME!)
          .download(fileRecord.supabasePath);

        if (downloadError || !fileBlob) {
          throw new Error(
            `Failed to download file from supabase: ${fileRecord.supabasePath}`
          );
        }

        const text = await fileBlob.text();
        const durationMinutes = calculateDurationFormText(text);
        console.log(
          `File ${fileId}: Calculated duration ${durationMinutes.toFixed(2)} mins`
        );

        await prisma.file.update({
          where: { id: fileId },
          data: {
            durationMinutes: durationMinutes,
            status: "PROCESSING",
          },
        });

        console.log(`File ${fileId}: Status updated to PROCESSING`);

        const doc = new Document({
          pageContent: text,
          metadata: {
            source: fileRecord.supabasePath,
            fileId: fileId,
          },
        });
        const chunks = await splitter.splitDocuments([doc]);
        const texts = chunks.map((chunk) => chunk.pageContent);

        console.log(`File ${fileId}: Split into ${texts.length} chunks`);

        console.log(`File ${fileId}: Generating embeddings...`);
        const embeddings = (await hf.featureExtraction({
          model: "sentence-transformers/all-MiniLM-L6-v2",
          inputs: texts,
        })) as number[][];

        console.log(`File ${fileId}: Generated ${embeddings.length} embeddings.`);

        const points = chunks.map((chunk, index) => ({
          id: uuidv4(),
          vector: embeddings[index],
          payload: {
            ...chunk.metadata,
            content: chunk.pageContent,
            fileId,
            loc: { pageNumber: index + 1 },
          },
        }));

        console.log(`File ${fileId}: Upserting ${points.length} points to Qdrant...`);
        await qdrantClient.upsert(COLLECTION_NAME, { points });
        console.log(`File ${fileId}: Stored embeddings in Qdrant.`);

        await prisma.file.update({
          where: { id: fileId },
          data: {
            status: "READY",
          },
        });
        console.log(`File ${fileId}: Status updated to READY`);
      } catch (error: any) {
        console.error(`Error processing job ${job.id} for file ${fileId}:`, error);
        await prisma.file.update({
          where: { id: fileId },
          data: {
            status: "ERROR",
          },
        });
        throw error; // Let BullMQ handle the retry if configured
      }
    },

    workerOptions
  );
} else {
  console.error("❌ Worker could not start: No valid Redis connection found. Check your UPSTASH_REDIS_URL.");
}

ensureCollectionExists()
  .then(() => {
    if (bullConnection) {
      console.log("🚀 Worker is ready and listening for jobs...");
    }
  })
  .catch((err) => {
    console.error("Failed to initialize worker:", err);
  });
export { worker };
