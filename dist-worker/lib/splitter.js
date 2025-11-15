"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitter = void 0;
const textsplitters_1 = require("@langchain/textsplitters");
exports.splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
