"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";

interface TranscriptSectionProps {
  fileId: string; 
}

export default function TranscriptSection({ fileId }: TranscriptSectionProps) {
  const [open, setOpen] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        console.log("Fetching transcript for fileId:", fileId);
        const res = await axios.get(`/api/files/${fileId}/transcript`);
        console.log("Transcript API response:", res);

        setTranscriptText(
          res.data.transcript || res.data || "No transcript available."
        );
      } catch (error: any) {
        console.error(
          "Failed to fetch transcript:",
          error.response || error.message
        );
        setTranscriptText("Error loading transcript.");
      } finally {
        setLoading(false);
      }
    };

    if (fileId) fetchTranscript();
  }, [fileId]);

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Original Transcript (.txt)
          </CardTitle>
          <CardDescription>
            Click to view the uploaded transcript content
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground italic">
              Loading transcript...
            </p>
          ) : transcriptText ? (
            <div className="text-sm text-muted-foreground max-h-[150px] overflow-hidden relative whitespace-pre-wrap">
              {transcriptText.slice(0, 400)}...
              <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-[#f8f7f5] to-transparent" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Transcript not found.
            </p>
          )}
          <p className="text-xs text-indigo-600 mt-3 font-medium">
            Click to view full transcript →
          </p>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-white border border-border/50 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <DialogDescription>
                View the full text of the uploaded transcript.
              </DialogDescription>
              <MessageSquare className="h-5 w-5 text-primary" />
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground italic mt-4">
              Loading transcript...
            </p>
          ) : (
            <div className="mt-4 text-sm text-gray-800 whitespace-pre-wrap max-h-[70vh] overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200">
              {transcriptText}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
