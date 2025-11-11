"use client";

import { useState } from "react";
import { Upload, File, Loader2 } from "lucide-react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [conversationText, setConversationText] = useState<string>("");
  const [fileId, setFileId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage("⏳ Uploading file...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload Response:", data);

      if (!data.success) throw new Error("Upload failed");

      setMessage("✅ File uploaded successfully!");

      const text = await selectedFile.text();
      setConversationText(text);

      setFileId(data.file.id);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!conversationText || !fileId) {
      setMessage("⚠️ Please upload a file first");
      return;
    }

    setIsUploading(true);
    setMessage("🧠 Analyzing conversation...");
    setAnalysisResult("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, conversationText }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let resultText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        console.log("[Gemini LLM chunk]:", chunk); // log each chunk
        resultText += chunk;
        setAnalysisResult(resultText); // update UI as stream arrives
      }

      console.log("[Gemini LLM final response]:", resultText);
      setMessage("✅ Analysis completed!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to analyze conversation");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
      <label
        htmlFor="fileInput"
        className={`flex flex-col items-center justify-center w-40 h-40 bg-white border-2 border-dashed rounded-2xl cursor-pointer transition ${
          isUploading
            ? "border-gray-300"
            : "border-indigo-300 hover:bg-gray-100"
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 size={42} className="animate-spin text-indigo-500 mb-2" />
            <span className="text-sm font-medium">Processing...</span>
          </>
        ) : (
          <>
            {file ? (
              <File size={42} className="text-indigo-500 mb-2" />
            ) : (
              <Upload size={42} className="text-indigo-500 mb-2" />
            )}
            <span className="text-sm font-medium">
              {file ? file.name : "Upload File"}
            </span>
          </>
        )}
      </label>

      <input
        id="fileInput"
        type="file"
        accept=".txt,.pdf,.md"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      <button
        onClick={handleAnalyze}
        disabled={isUploading || !conversationText}
        className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50"
      >
        Analyze
      </button>

      {message && (
        <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
      )}

      {analysisResult && (
        <div className="mt-6 p-4 w-full max-w-xl bg-white shadow rounded-md text-gray-800">
          <h3 className="font-semibold mb-2">Analysis Result:</h3>
          <pre className="whitespace-pre-wrap">{analysisResult}</pre>
        </div>
      )}
    </div>
  );
}
