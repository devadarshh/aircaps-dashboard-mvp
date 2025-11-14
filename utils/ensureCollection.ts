import { qdrantClient, COLLECTION_NAME } from "@/lib/qdrant";

const VECTOR_DIMENSION = 384;
const VECTOR_DISTANCE = "Cosine";
const PAYLOAD_INDEX_FIELD = "fileId";

export async function ensureCollectionExists() {
  let collectionInfo;
  try {
    collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    console.log(`[Qdrant] Collection ${COLLECTION_NAME} already exists.`);
  } catch (err: any) {
    if (err.status === 404) {
      console.log(
        `[Qdrant] Collection ${COLLECTION_NAME} does not exist. Creating...`
      );
      await qdrantClient.recreateCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_DIMENSION,
          distance: VECTOR_DISTANCE,
        },
      });
      console.log(`[Qdrant]  Created collection: ${COLLECTION_NAME}`);
      collectionInfo = await qdrantClient.getCollection(COLLECTION_NAME);
    } else {
      console.error("[Qdrant] Error checking collection:", err);
      throw err;
    }
  }

  try {
    const payloadSchema = collectionInfo.payload_schema || {};

    if (!payloadSchema[PAYLOAD_INDEX_FIELD]) {
      console.warn(
        `[Qdrant]  Payload index '${PAYLOAD_INDEX_FIELD}' is missing. Creating...`
      );

      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: PAYLOAD_INDEX_FIELD,
        field_schema: "keyword",
        wait: true,
      });

      console.log(
        `[Qdrant] Created '${PAYLOAD_INDEX_FIELD}' (keyword) payload index.`
      );
    } else {
      console.log(
        `[Qdrant]  Payload index '${PAYLOAD_INDEX_FIELD}' already exists.`
      );
    }
  } catch (err) {
    console.error("[Qdrant] Failed to check/create payload index:", err);
  }
}
