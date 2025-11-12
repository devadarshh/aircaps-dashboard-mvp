"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  CheckCircle2,
  Upload as UploadIcon,
  X,
  Brain,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>("");
  const [conversationText, setConversationText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadSuccess(false);
    setAnalysisDone(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      toast({ title: "Uploading...", description: "Please wait." });

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!res.data.success) throw new Error("Upload failed");

      const text = await file.text();
      setConversationText(text);
      setFileId(res.data.file.id);

      setUploadSuccess(true);
      toast({
        title: "✅ Upload Successful",
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "❌ Upload Failed",
        description: "Something went wrong while uploading.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!conversationText || !fileId) {
      toast({
        title: "⚠️ Missing file",
        description: "Please upload a file first.",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisResult("");
      toast({ title: "🧠 Analyzing...", description: "Processing your file." });

      const res = await axios.post(
        "/api/analyze",
        { fileId, conversationText },
        { responseType: "stream" } // for Node.js; Next.js edge stream support differs
      );

      setTimeout(() => {
        router.push(`/dashboard/conversation/${fileId}`);
      }, 1500);
      // ⚠️ Axios stream reading is not supported in the browser,
      // so we’ll handle normal JSON/text streaming instead:
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, conversationText }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let resultText = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        resultText += chunk;
        setAnalysisResult(resultText);
      }

      setAnalysisDone(true);
      toast({
        title: "✅ Analysis Complete",
        description: "Your session has been analyzed successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "❌ Analysis Failed",
        description: "Something went wrong while analyzing the file.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#e9e6e2] p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Upload Captions
          </h1>
          <p className="text-muted-foreground">
            Upload and process your live caption sessions
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload Session Data</CardTitle>
              <CardDescription>
                Upload your caption files or paste session information
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Morning Team Meeting"
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="file">Caption File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      accept=".txt,.srt,.vtt,.pdf,.md"
                      multiple={false}
                      onChange={handleFileChange}
                    />
                    {!file ? (
                      <label htmlFor="file" className="cursor-pointer">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-foreground font-medium mb-1">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports .txt, .srt, .vtt, .pdf, .md
                        </p>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                        <div className="flex items-center gap-3 text-left">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUploading || uploadSuccess || !file}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Upload Successful
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Upload Session
                    </>
                  )}
                </Button>

                {/* Analyze Button */}
                {uploadSuccess && (
                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    className="w-full"
                    disabled={isAnalyzing || analysisDone}
                  >
                    {isAnalyzing ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : analysisDone ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Analysis Complete
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze Session
                      </>
                    )}
                  </Button>
                )}
              </form>

              {/* Analysis Output */}
              {analysisResult && (
                <div className="mt-6 p-4 bg-white border rounded-md shadow-sm text-sm text-foreground whitespace-pre-wrap">
                  <h3 className="font-semibold mb-2">Analysis Result:</h3>
                  {analysisResult}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Guide</CardTitle>
              <CardDescription>How to upload your sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Export from AirCaps",
                  desc: "Get your caption file from your glasses",
                },
                {
                  step: 2,
                  title: "Add Details",
                  desc: "Provide a title and optional notes",
                },
                {
                  step: 3,
                  title: "Process & Analyze",
                  desc: "We'll analyze your session automatically",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {step}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Processing typically takes 30–60 seconds. You’ll be able to
                  view analytics immediately after.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Upload;
