import { qdrantClient, COLLECTION_NAME } from "@/lib/qdrant";

export const ensureCollectionExists = async () => {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(
    (c) => c.name === COLLECTION_NAME
  );

  if (!exists) {
    console.log(`Creating collection "${COLLECTION_NAME}"...`);
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 384,
        distance: "Cosine",
      },
    });
  } else {
    console.log(`Collection "${COLLECTION_NAME}" already exists.`);
  }
};
