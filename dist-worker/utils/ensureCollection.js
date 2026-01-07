"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureCollectionExists = ensureCollectionExists;
const qdrant_1 = require("../lib/qdrant");
const VECTOR_DIMENSION = 384;
const VECTOR_DISTANCE = "Cosine";
const PAYLOAD_INDEX_FIELD = "fileId";
async function ensureCollectionExists() {
    let collectionInfo;
    try {
        collectionInfo = await qdrant_1.qdrantClient.getCollection(qdrant_1.COLLECTION_NAME);
        console.log(`[Qdrant] Collection ${qdrant_1.COLLECTION_NAME} already exists.`);
    }
    catch (err) {
        if (err) {
            console.log(`[Qdrant] Collection ${qdrant_1.COLLECTION_NAME} does not exist. Creating...`);
            await qdrant_1.qdrantClient.recreateCollection(qdrant_1.COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_DIMENSION,
                    distance: VECTOR_DISTANCE,
                },
            });
            console.log(`[Qdrant]  Created collection: ${qdrant_1.COLLECTION_NAME}`);
            collectionInfo = await qdrant_1.qdrantClient.getCollection(qdrant_1.COLLECTION_NAME);
        }
        else {
            console.error("[Qdrant] Error checking collection:", err);
            throw err;
        }
    }
    try {
        const payloadSchema = collectionInfo.payload_schema || {};
        if (!payloadSchema[PAYLOAD_INDEX_FIELD]) {
            console.warn(`[Qdrant]  Payload index '${PAYLOAD_INDEX_FIELD}' is missing. Creating...`);
            await qdrant_1.qdrantClient.createPayloadIndex(qdrant_1.COLLECTION_NAME, {
                field_name: PAYLOAD_INDEX_FIELD,
                field_schema: "keyword",
                wait: true,
            });
            console.log(`[Qdrant] Created '${PAYLOAD_INDEX_FIELD}' (keyword) payload index.`);
        }
        else {
            console.log(`[Qdrant]  Payload index '${PAYLOAD_INDEX_FIELD}' already exists.`);
        }
    }
    catch (err) {
        console.error("[Qdrant] Failed to check/create payload index:", err);
    }
}
