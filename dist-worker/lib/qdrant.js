"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLLECTION_NAME = exports.qdrantClient = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
exports.qdrantClient = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
exports.COLLECTION_NAME = "document-embeddings-hf";
