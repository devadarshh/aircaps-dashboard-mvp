"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { FileText, X, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { toast } from "sonner";

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [isWorkerDone, setIsWorkerDone] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string>("");
  const [conversationText, setConversationText] = useState<string>("");
  const [sessionTitle] = useState<string>("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setUploadSuccess(false);
    setAnalysisDone(false);
    setIsWorkerDone(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      toast.info("Uploading... Please wait.");

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

      toast.success(`${file.name} uploaded successfully.`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  const checkFileStatus = async () => {
    if (!fileId) return null;

    try {
      const res = await axios.get(`/api/fileStatus?fileId=${fileId}`);
      return res.data.status;
    } catch (err) {
      console.error("Failed to check file status:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!uploadSuccess) return;

    const interval = setInterval(async () => {
      const status = await checkFileStatus();
      if (status === "READY") {
        setIsWorkerDone(true);
        clearInterval(interval);
        toast.info("File processed. You can now analyze it.");
      } else if (status === "ERROR" || status === "FAILED") {
        clearInterval(interval);
        setUploadSuccess(false); // Reset upload success to allow retry
        setIsUploading(false);
        toast.error("File processing failed. Please try uploading again.");
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [uploadSuccess, fileId]);

  const handleAnalyze = async () => {
    if (!conversationText || !fileId) {
      toast.warn("Please upload a file first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      toast.info("Analyzing... Please wait.");

      const res = await axios.post("/api/analyze", {
        fileId,
        conversationText,
        title: sessionTitle,
      });

      if (!res.data.success) throw new Error("Analysis failed");

      const analysisId = res.data.analysis.id;
      setAnalysisDone(true);
      toast.success("Analysis complete!");

      setTimeout(() => {
        router.push(`/dashboard/conversation/${analysisId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while analyzing the file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6 transition-all">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-foreground">
            Upload Captions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload and process your live caption sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Card */}
          <Card className="lg:col-span-2 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Upload Session Data</CardTitle>
              <CardDescription>
                Upload your caption files or paste session information.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="file"
                    className="text-base font-medium cursor-pointer"
                  >
                    Caption File
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/60 transition-colors relative cursor-pointer">
                    {!file ? (
                      <label
                        htmlFor="file"
                        className="flex flex-col items-center w-full h-full cursor-pointer group"
                      >
                        <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-3">
                          <FileText className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <p className="font-medium mb-1 text-foreground group-hover:text-primary transition-colors">
                          Drop your file or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Supports .txt file
                        </p>
                        <input
                          id="file"
                          type="file"
                          accept=".txt"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted rounded-md cursor-pointer">
                        <div className="flex items-center gap-3 text-left">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {uploadSuccess && !isWorkerDone && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary animate-pulse">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Processing your file...
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full transition-all hover:scale-[1.02] cursor-pointer"
                  disabled={isUploading || uploadSuccess || !file}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadSuccess ? (
                    "Uploaded"
                  ) : (
                    "Upload Session"
                  )}
                </Button>

                {uploadSuccess && (
                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    className="w-full transition-all hover:scale-[1.02] cursor-pointer"
                    disabled={isAnalyzing || analysisDone || !isWorkerDone}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : analysisDone ? (
                      "Done"
                    ) : isWorkerDone ? (
                      "Analyze Session"
                    ) : (
                      "Waiting for Worker..."
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Quick Guide Card */}
          <Card className="shadow-md rounded-2xl cursor-pointer">
            <CardHeader>
              <CardTitle className="text-xl">Quick Guide</CardTitle>
              <CardDescription>
                How to upload and analyze your sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  step: 1,
                  title: "Export from AirCaps",
                  desc: "Get your caption file from your glasses or device.",
                },
                {
                  step: 2,
                  title: "Upload File",
                  desc: "Select your caption file and click on 'Upload Session'.",
                },
                {
                  step: 3,
                  title: "Click Analyze",
                  desc: "After upload, click on 'Analyze Session' to process your captions.",
                },
                {
                  step: 4,
                  title: "View Insights",
                  desc: "Once analysis completes, view your conversation analytics instantly.",
                },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex gap-3 cursor-pointer">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
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
                  ⏱️ Processing typically takes 30–60 seconds. You can access
                  analytics immediately after completion.
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
