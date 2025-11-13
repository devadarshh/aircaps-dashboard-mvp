"use client";

import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, MessageSquare } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";
import axios from "axios";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useEffect, useState } from "react";

// ------------------- Tooltip -------------------
const CustomSentimentTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const value =
      typeof payload[0].value === "object"
        ? JSON.stringify(payload[0].value)
        : payload[0].value;
    return (
      <div className="p-2 bg-background border border-border shadow-lg rounded-md">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{`Sentiment: ${value}`}</p>
      </div>
    );
  }
  return null;
};

// ------------------- Radar Tick -------------------
const renderPolarAngleAxis = ({ payload, x, y, cx, cy }: any) => {
  const label =
    typeof payload.value === "object"
      ? JSON.stringify(payload.value)
      : payload.value;
  const parts = String(label).split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={parts.length > 1 ? 0 : 4}
        textAnchor={x > cx ? "start" : "end"}
        fill="hsl(var(--foreground))"
        fontSize={12}
      >
        {parts.map((part: string, index: number) => (
          <tspan key={index} x={0} dy={index === 0 ? 0 : 15}>
            {part}
          </tspan>
        ))}
      </text>
    </g>
  );
};

// ------------------- Component -------------------
export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`/api/analysis/${id}`);
        setAnalysis(res.data.analysis);
      } catch (err: any) {
        console.error("Error fetching analysis:", err);
        if (err.response?.status === 404) setError("Analysis not found");
        else setError("Failed to fetch analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!analysis) return <div>No analysis available</div>;

  // ------------------- Extract dynamic data -------------------
  const { rawResponse } = analysis;

  // Talk Time Distribution
  const totalDuration =
    rawResponse.talkTimeDist?.reduce(
      (a: number, b: any) => a + b.durationSec,
      0
    ) || 1;
  const talkTimeData =
    rawResponse.talkTimeDist?.map((item: any) => ({
      name: item.speaker || "Unknown",
      value: Math.round((item.durationSec / totalDuration) * 100),
      color:
        item.speaker === "Adarsh"
          ? "hsl(var(--primary))"
          : "hsl(var(--chart-2))",
    })) || [];

  // Sentiment over Time
  const sentimentOverTime =
    rawResponse.sentiments?.map((s: any) => ({
      time: s.timestamp || "0:00",
      sentiment: typeof s.score === "number" ? Math.round(s.score * 100) : 0,
    })) || [];

  // Key Metrics
  const keyMetricsData = [
    {
      metric: "Speaking Pace",
      value: Number(rawResponse.speakingMetrics?.pace || 0),
      ideal: 150,
      fullMark: 200,
    },
    {
      metric: "Filler Words",
      value: Number(rawResponse.speakingMetrics?.fillerWords || 0),
      ideal: 5,
      fullMark: 20,
    },
    {
      metric: "Longest Monologue",
      value: Number(rawResponse.longestMonologueSec || 0),
      ideal: 30,
      fullMark: 60,
    },
    {
      metric: "Talk/Listen Ratio",
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
      <div className="min-h-screen w-full bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/analytics")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                {analysis.title}
              </h1>
              <p className="text-muted-foreground flex items-center gap-4 mt-1">
                <span>{new Date(analysis.createdAt).toLocaleDateString()}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.ceil(totalDuration / 60)} minutes
                </span>
              </p>
            </div>
          </div>

          {/* Talk Time Card */}
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Talk Time Distribution</CardTitle>
              <CardDescription>Who spoke and for how long</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={talkTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {talkTimeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 w-full mt-4">
                {talkTimeData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="lg:col-span-3 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>AI Summary</CardTitle>
              <CardDescription>Conversation overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 leading-relaxed">
              <p>{rawResponse.summary}</p>
              <div>
                <p className="text-sm font-medium mb-2">
                  Action Items / Todos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {rawResponse.todos?.map((item: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {typeof item === "object" ? JSON.stringify(item) : item}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Card */}
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Your Speaking Metrics</CardTitle>
              <CardDescription>Communication performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={keyMetricsData} cx="50%" cy="50%">
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={renderPolarAngleAxis}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, "dataMax + 20"]}
                    stroke="none"
                    axisLine={false}
                    tick={false}
                  />
                  <Radar
                    name="Your Score"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name="Ideal"
                    dataKey="ideal"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sentiment Over Time */}
          <Card className="lg:col-span-5 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Sentiment Over Time</CardTitle>
              <CardDescription>
                Emotional flow throughout the discussion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={sentimentOverTime}>
                  <defs>
                    <linearGradient
                      id="colorSentiment"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    domain={[0, 100]}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomSentimentTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sentiment"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorSentiment)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card className="lg:col-span-5 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Full Conversation Transcript
              </CardTitle>
              <CardDescription>Speaker-tagged full transcript</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                {rawResponse.transcript?.map((t: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t.timestamp}
                      </span>
                      <span className="text-sm font-semibold">{t.speaker}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                      {typeof t.text === "object"
                        ? JSON.stringify(t.text)
                        : t.text}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
