"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, File, Loader2 } from "lucide-react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMessage("⏳ Uploading file...");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await axios.post("/api/upload", formData);
      console.log("Response", res.data);

      setMessage("✅ File uploaded successfully!");
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800">
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
            <span className="text-sm font-medium">Uploading...</span>
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
        accept=".pdf,.txt,.md,.csv,.json,.log"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      {message && (
        <p className="mt-6 text-sm font-medium text-gray-700">{message}</p>
      )}
      <button>Analyze</button>
    </div>
  );
}
