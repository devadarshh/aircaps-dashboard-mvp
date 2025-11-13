"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AISummaryProps {
  summary: string;
}

export default function AISummary({ summary }: AISummaryProps) {
  return (
    <Card className="shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
        <CardDescription>Overall conversation insights</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 leading-relaxed">
        <p className="text-[15px] text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
