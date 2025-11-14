"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import axios from "axios";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useState } from "react";
import TalkTimeDistribution from "@/components/Analytics/TalkTimeDistribution";
import SpeakingMetrics from "@/components/Analytics/SpeakingMetrics";
import SentimentOverTime from "@/components/Analytics/SentimentOverTime";
import ActionItems from "@/components/Analytics/ActionItems";
import TranscriptSection from "@/components/Analytics/TranscriptSection";
import AISummary from "@/components/Analytics/AISummary";
import { Skeleton } from "@/components/ui/skeleton";
import { getToneColor } from "@/utils/getToneColor";

interface TalkTimeItem {
  speaker: string;
  durationSec: number;
}
interface SentimentItem {
  timestamp: string;
  score: number;
}
interface SpeakingMetricsInterface {
  pace?: number;
  fillerWords?: number;
}
interface RawResponse {
  talkTimeDist?: TalkTimeItem[];
  sentiments?: SentimentItem[];
  speakingMetrics?: SpeakingMetricsInterface;
  longestMonologueSec?: number;
  talkListenRatio?: number;
  summary?: string;
  todos?: string[];
  transcript?: string[];
}
interface Analysis {
  title: string;
  createdAt: string;
  tone?: string;
  rawResponse: RawResponse;
  fileId?: string;
}

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/analysis/${id}`);
        setAnalysis(res.data.analysis);
      } catch (err) {
        console.error("Error fetching analysis", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[80vh] w-full bg-[#F9FAFB] pb-20">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* TalkTimeDistribution Skeleton */}
              <Skeleton className="lg:col-span-4 h-64 rounded-xl" />

              <Skeleton className="lg:col-span-8 h-64 rounded-xl" />

              <Skeleton className="lg:col-span-7 h-48 rounded-xl" />

              <Skeleton className="lg:col-span-5 h-48 rounded-xl" />

              <Skeleton className="lg:col-span-12 h-48 rounded-xl" />

              <Skeleton className="lg:col-span-12 h-40 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis)
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-muted-foreground">
            No data found for this conversation.
          </p>
        </div>
      </DashboardLayout>
    );

  const { rawResponse } = analysis;
  const totalDuration =
    rawResponse.talkTimeDist?.reduce((a, b) => a + b.durationSec, 0) || 1;
  const sentimentOverTimeData =
    rawResponse.sentiments?.map((s) => ({
      time: s.timestamp || "0:00",
      sentiment: typeof s.score === "number" ? Math.round(s.score * 100) : 0,
    })) || [];

  const keyMetricsData = [
    {
      metric: "Pace",
      value: Number(rawResponse.speakingMetrics?.pace || 0),
      ideal: 150,
      fullMark: 200,
    },
    {
      metric: "Fillers",
      value: Number(rawResponse.speakingMetrics?.fillerWords || 0),
      ideal: 5,
      fullMark: 20,
    },
    {
      metric: "Longest Mono.",
      value: Number(rawResponse.longestMonologueSec || 0),
      ideal: 30,
      fullMark: 60,
    },
    {
      metric: "Talk Ratio",
      value:
        typeof rawResponse.talkListenRatio === "number"
          ? Math.round(rawResponse.talkListenRatio * 100)
          : 0,
      ideal: 50,
      fullMark: 100,
    },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full bg-[#F9FAFB] pb-20">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* --- Header Section --- */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/analytics")}
                className="h-10 w-10 -ml-2 text-muted-foreground hover:text-primary transition-all hover:scale-105 cursor-pointer"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                    {analysis.title}
                  </h1>
                  <Badge
                    variant="outline"
                    className={`text-sm font-medium px-2.5 py-0.5 border transition-colors cursor-pointer ${getToneColor(
                      analysis.tone || "curious"
                    )}`}
                  >
                    {analysis.tone || "Neutral"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(analysis.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{Math.ceil(totalDuration / 60)} mins</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-white hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* --- Bento Grid Layout --- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-full transition-transform hover:scale-[1.01]">
              <TalkTimeDistribution
                talkTimeDist={rawResponse.talkTimeDist || []}
              />
            </div>
            <div className="lg:col-span-8 h-full transition-transform hover:scale-[1.01]">
              <SpeakingMetrics keyMetricsData={keyMetricsData} />
            </div>
            <div className="lg:col-span-7 flex flex-col transition-transform hover:scale-[1.01]">
              <AISummary
                summary={rawResponse.summary}
                className="grow h-full"
              />
            </div>
            <div className="lg:col-span-5 flex flex-col transition-transform hover:scale-[1.01]">
              <ActionItems
                todos={rawResponse.todos || []}
                className="grow h-full"
              />
            </div>
            <div className="lg:col-span-12 transition-transform hover:scale-[1.01]">
              <SentimentOverTime sentimentOverTime={sentimentOverTimeData} />
            </div>
            <div className="lg:col-span-12 transition-transform hover:scale-[1.01] cursor-pointer">
              <TranscriptSection fileId={analysis.fileId!} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
