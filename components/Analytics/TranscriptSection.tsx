"use client";

import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";

interface TranscriptSectionProps {
  transcript: any[];
}

export default function TranscriptSection({
  transcript,
}: TranscriptSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Full Conversation Transcript
          </CardTitle>
          <CardDescription>
            Click to view the complete conversation
          </CardDescription>
        </CardHeader>

        <CardContent>
          {transcript && transcript.length > 0 ? (
            <div className="space-y-3 max-h-[180px] overflow-y-hidden relative">
              {transcript.slice(0, 5).map((t, i) => (
                <div key={i}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t.timestamp || "00:00"}
                    </span>
                    <span className="text-sm font-semibold">
                      {t.speaker || "User"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                    {typeof t.text === "object"
                      ? JSON.stringify(t.text)
                      : t.text}
                  </p>
                </div>
              ))}
              <div className="absolute bottom-0 left-0 w-full h-16 bg-linear-to-t from-[#f8f7f5] to-transparent" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No transcript data available.
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
              <MessageSquare className="h-5 w-5 text-primary" />
              Full Conversation Transcript
            </DialogTitle>
          </DialogHeader>

          {transcript && transcript.length > 0 ? (
            <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {transcript.map((t, i) => (
                <div
                  key={i}
                  className="hover:bg-[#f7f5f2] p-3 rounded-lg transition-colors"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t.timestamp || "00:00"}
                    </span>
                    <span className="text-sm font-semibold">
                      {t.speaker || "User"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pl-8">
                    {typeof t.text === "object"
                      ? JSON.stringify(t.text)
                      : t.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic mt-4">
              Transcript unavailable for this conversation.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
