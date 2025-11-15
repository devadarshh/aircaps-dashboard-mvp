"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hf = void 0;
const inference_1 = require("@huggingface/inference");
exports.hf = new inference_1.HfInference(process.env.HUGGINGFACE_API_KEY);
