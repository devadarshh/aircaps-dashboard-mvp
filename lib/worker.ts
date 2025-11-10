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

const workerOptions: WorkerOptions = {
  concurrency: 10,
  connection: redis,
  skipVersionCheck: true,
};
interface FileJobData {
  fileId: string;
}
const worker = new Worker<FileJobData>(
  "file-upload-queue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    const { fileId } = job.data;

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
    const doc = new Document({
      pageContent: text,
      metadata: {
        source: fileRecord.supabasePath,
        fileId: fileId,
      },
    });
    const chunks = await splitter.splitDocuments([doc]);
    const texts = chunks.map((chunk) => chunk.pageContent);

    const embeddings = (await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: texts,
    })) as number[][];

    console.log(`Generated ${embeddings.length} embeddings.`);

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
    await qdrantClient.upsert(COLLECTION_NAME, { points });
    console.log(`Stored ${points.length} embeddings for file ${fileId}`);
  },
  workerOptions
);
ensureCollectionExists()
  .then(() => {
    console.log("Worker is ready and listening for jobs...");
  })
  .catch((err) => {
    console.error("Failed to initialize worker:", err);
  });
export { worker };
