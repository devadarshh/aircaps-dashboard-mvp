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
import {
  FileText,
  CheckCircle2,
  Upload as UploadIcon,
  X,
  Brain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

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
  const { toast } = useToast();
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
        title: "Upload Successful",
        description: `${file.name} uploaded successfully.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Upload Failed",
        description: "Something went wrong while uploading.",
        variant: "destructive",
      });
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
      console.log(status);
      if (status === "READY") {
        setIsWorkerDone(true);
        clearInterval(interval);
        toast({
          title: " File processed",
          description: "You can now analyze it.",
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [uploadSuccess, fileId, toast]);

  const handleAnalyze = async () => {
    if (!conversationText || !fileId) {
      toast({
        title: "Missing file",
        description: "Please upload a file first.",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      toast({ title: " Analyzing...", description: "Processing your file." });

      const res = await axios.post("/api/analyze", {
        fileId,
        conversationText,
        title: sessionTitle,
      });

      if (!res.data.success) throw new Error("Analysis failed");

      const analysisId = res.data.analysis.id;

      toast({
        title: " Analysis Complete",
        description: "Your session has been analyzed successfully.",
      });

      setAnalysisDone(true);

      setTimeout(() => {
        router.push(`/dashboard/conversation/${analysisId}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      toast({
        title: " Analysis Failed",
        description: "Something went wrong while analyzing the file.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#e9e6e2] p-4 sm:p-6 lg:p-8 space-y-6 transition-all">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-gray-900">
            Upload Captions
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Upload and process your live caption sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <Label htmlFor="file" className="text-base font-medium">
                    Caption File
                  </Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/60 transition-colors relative">
                    {!file ? (
                      <label
                        htmlFor="file"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium mb-1 text-gray-700">
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
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full transition-all hover:scale-[1.02]"
                  disabled={isUploading || uploadSuccess || !file}
                >
                  {isUploading
                    ? "Uploading..."
                    : uploadSuccess
                    ? "Uploaded"
                    : "Upload Session"}
                </Button>

                {uploadSuccess && (
                  <Button
                    type="button"
                    onClick={handleAnalyze}
                    className="w-full transition-all hover:scale-[1.02]"
                    disabled={isAnalyzing || analysisDone || !isWorkerDone}
                  >
                    {isAnalyzing
                      ? "Analyzing..."
                      : analysisDone
                      ? "Done "
                      : "Analyze Session"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
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
                <div key={step} className="flex gap-3">
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
