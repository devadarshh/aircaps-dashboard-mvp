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
import { MessageSquare, Type, Languages, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TranscriptSectionProps {
  fileId: string;
}

export default function TranscriptSection({ fileId }: TranscriptSectionProps) {
  const [open, setOpen] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isLargeText, setIsLargeText] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

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
      } catch (error) {
        console.error("Failed to fetch transcript:", error);
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
              <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent" />
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
        <DialogContent className="sm:max-w-[95vw] lg:max-w-[1400px] bg-white border-none rounded-[2rem] p-0 overflow-hidden flex flex-col h-[90vh] shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] focus:outline-none">
          {/* Enhanced Header - Wrapped in DialogHeader for accessibility */}
          <div className="px-8 py-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white shrink-0">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 shadow-inner">
                <MessageSquare className="h-7 w-7 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <DialogHeader className="p-0 space-y-1">
                  <DialogTitle className="text-2xl font-extrabold text-gray-900 tracking-tight text-left">
                    Conversation Transcript
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 font-medium text-left">
                    Review and analyze the captured session data.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl border border-gray-200/50 shrink-0">
              <div
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all cursor-pointer select-none",
                  isLargeText ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-gray-200/50"
                )}
                onClick={() => setIsLargeText(!isLargeText)}
              >
                <Type className={cn("h-4 w-4", isLargeText ? "text-indigo-600" : "text-gray-400")} />
                <span className={cn("text-[10px] font-black uppercase tracking-widest", isLargeText ? "text-gray-900" : "text-gray-500")}>
                  Readability
                </span>
                <Switch
                  checked={isLargeText}
                  onCheckedChange={setIsLargeText}
                  className="scale-75 origin-right"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="w-px h-6 bg-gray-200 mx-1" />

              <div
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 rounded-xl transition-all cursor-pointer select-none",
                  showTranslation ? "bg-white shadow-sm ring-1 ring-black/5" : "hover:bg-gray-200/50"
                )}
                onClick={() => setShowTranslation(!showTranslation)}
              >
                <Languages className={cn("h-4 w-4", showTranslation ? "text-indigo-600" : "text-gray-400")} />
                <span className={cn("text-[10px] font-black uppercase tracking-widest", showTranslation ? "text-gray-900" : "text-gray-500")}>
                  Spanish (ES)
                </span>
                <Switch
                  checked={showTranslation}
                  onCheckedChange={setShowTranslation}
                  className="scale-75 origin-right"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col bg-[#F9FAFB]">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-400 font-bold tracking-tighter uppercase">
                    Loading Transcript...
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <div className="px-8 py-10">
                  <div className={cn(
                    "grid grid-cols-1 gap-10 transition-all duration-500 ease-in-out",
                    showTranslation ? "md:grid-cols-2" : "max-w-6xl mx-auto"
                  )}>
                    {/* Original Text */}
                    <div className="space-y-4">
                      {showTranslation && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                          <span className="h-px w-8 bg-gray-200" />
                          Original English
                        </div>
                      )}
                      <div className={cn(
                        "bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-gray-800 whitespace-pre-wrap font-medium transition-all duration-300",
                        isLargeText ? "text-xl leading-relaxed" : "text-base leading-relaxed"
                      )}>
                        {transcriptText}
                      </div>
                    </div>

                    {/* Translated Text */}
                    {showTranslation && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">
                          <span className="h-px w-8 bg-indigo-100" />
                          Spanish Translation
                        </div>
                        <div className={cn(
                          "bg-indigo-600 p-8 rounded-[2rem] border border-indigo-500 shadow-lg text-white whitespace-pre-wrap font-medium transition-all duration-300 selection:bg-white/20",
                          isLargeText ? "text-xl leading-relaxed" : "text-base leading-relaxed"
                        )}>
                          {transcriptText.split('\n').map(line => line.trim() ? `[Traducción]: ${line}` : '').join('\n')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
