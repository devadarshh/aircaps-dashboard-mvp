"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const uuid_1 = require("uuid");
const documents_1 = require("@langchain/core/documents");
const supabase_1 = require("../lib/supabase");
const prisma_1 = require("../lib/prisma");
const hfClient_1 = require("../lib/hfClient");
const qdrant_1 = require("../lib/qdrant");
const splitter_1 = require("../lib/splitter");
const redis_1 = require("../lib/redis");
const ensureCollection_1 = require("../utils/ensureCollection");
const _redisMarker = redis_1.redis;
const bullConnection = _redisMarker.__isNoop
    ? undefined
    : redis_1.redis;
const baseWorkerOptions = {
    concurrency: 10,
    skipVersionCheck: true,
};
const workerOptions = bullConnection
    ? Object.assign(Object.assign({}, baseWorkerOptions), { connection: bullConnection })
    : baseWorkerOptions;
function calculateDurationFormText(transcript) {
    if (!transcript || transcript.length === 0) {
        return 0;
    }
    const wordCount = transcript.split(/\s+/).length;
    const wordsPerMinute = 150;
    const durationMinutes = wordCount / wordsPerMinute;
    return durationMinutes;
}
let worker = null;
exports.worker = worker;
if (bullConnection) {
    exports.worker = worker = new bullmq_1.Worker("file-upload-queue", async (job) => {
        console.log(`Processing job ${job.id} with data:`, job.data);
        const { fileId } = job.data;
        try {
            const fileRecord = await prisma_1.prisma.file.findUnique({
                where: { id: fileId },
            });
            if (!fileRecord) {
                throw new Error(`File with ID ${fileId} not found in the database`);
            }
            const { data: fileBlob, error: downloadError } = await supabase_1.supabase.storage
                .from(process.env.SUPABASE_BUCKET_NAME)
                .download(fileRecord.supabasePath);
            if (downloadError || !fileBlob) {
                throw new Error(`Failed to download file from supabase: ${fileRecord.supabasePath}`);
            }
            const text = await fileBlob.text();
            const durationMinutes = calculateDurationFormText(text);
            console.log(`File ${fileId}: Calculated duration ${durationMinutes.toFixed(2)} mins`);
            await prisma_1.prisma.file.update({
                where: { id: fileId },
                data: {
                    durationMinutes: durationMinutes,
                    status: "PROCESSING",
                },
            });
            console.log(`File ${fileId}: Status updated to PROCESSING`);
            const doc = new documents_1.Document({
                pageContent: text,
                metadata: {
                    source: fileRecord.supabasePath,
                    fileId: fileId,
                },
            });
            const chunks = await splitter_1.splitter.splitDocuments([doc]);
            const texts = chunks.map((chunk) => chunk.pageContent);
            console.log(`File ${fileId}: Split into ${texts.length} chunks`);
            console.log(`File ${fileId}: Generating embeddings...`);
            const embeddings = (await hfClient_1.hf.featureExtraction({
                model: "sentence-transformers/all-MiniLM-L6-v2",
                inputs: texts,
            }));
            console.log(`File ${fileId}: Generated ${embeddings.length} embeddings.`);
            const points = chunks.map((chunk, index) => ({
                id: (0, uuid_1.v4)(),
                vector: embeddings[index],
                payload: Object.assign(Object.assign({}, chunk.metadata), { content: chunk.pageContent, fileId, loc: { pageNumber: index + 1 } }),
            }));
            console.log(`File ${fileId}: Upserting ${points.length} points to Qdrant...`);
            await qdrant_1.qdrantClient.upsert(qdrant_1.COLLECTION_NAME, { points });
            console.log(`File ${fileId}: Stored embeddings in Qdrant.`);
            await prisma_1.prisma.file.update({
                where: { id: fileId },
                data: {
                    status: "READY",
                },
            });
            console.log(`File ${fileId}: Status updated to READY`);
        }
        catch (error) {
            console.error(`Error processing job ${job.id} for file ${fileId}:`, error);
            await prisma_1.prisma.file.update({
                where: { id: fileId },
                data: {
                    status: "ERROR",
                },
            });
            throw error; // Let BullMQ handle the retry if configured
        }
    }, workerOptions);
}
else {
    console.error("❌ Worker could not start: No valid Redis connection found. Check your UPSTASH_REDIS_URL.");
}
(0, ensureCollection_1.ensureCollectionExists)()
    .then(() => {
    if (bullConnection) {
        console.log("🚀 Worker is ready and listening for jobs...");
    }
})
    .catch((err) => {
    console.error("Failed to initialize worker:", err);
});
