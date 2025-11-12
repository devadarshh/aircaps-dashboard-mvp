"use client";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Upload as UploadIcon, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import FileUpload from "@/components/FileUpload";

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      toast({
        title: "Upload successful",
        description: "Your caption data has been processed and saved.",
      });

      setTimeout(() => setUploadSuccess(false), 3000);
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Upload Captions
          </h1>
          <p className="text-muted-foreground">
            Upload and process your live caption sessions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upload Session Data</CardTitle>
              <CardDescription>
                Upload your caption files or paste session information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Morning Team Meeting"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Caption File</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="file"
                      className="hidden"
                      accept=".txt,.srt,.vtt"
                    />
                    <label htmlFor="file" className="cursor-pointer">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-foreground font-medium mb-1">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Supports .txt, .srt, .vtt files
                      </p>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Session Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional context or notes about this session..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isUploading || uploadSuccess}
                >
                  {isUploading ? (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4 animate-spin" />
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
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Guide</CardTitle>
              <CardDescription>How to upload your sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Export from AirCaps
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get your caption file from your glasses
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add Details</p>
                    <p className="text-sm text-muted-foreground">
                      Provide a title and optional notes
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Process & Analyze
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We'll analyze your session automatically
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Processing typically takes 30-60 seconds. You'll be able to
                  view analytics immediately after.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <FileUpload />
    </DashboardLayout>
  );
};

export default Upload;
