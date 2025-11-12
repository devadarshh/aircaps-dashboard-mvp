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
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// --- MOCK DATA (Same as before) ---
const talkTimeData = [
  { name: "You (Adarsh)", value: 62, color: "hsl(var(--primary))" },
  { name: "Sarah", value: 28, color: "hsl(var(--chart-2))" },
  { name: "Michael", value: 10, color: "hsl(var(--chart-3))" },
];
const sentimentOverTime = [
  { time: "0m", sentiment: 50 },
  { time: "5m", sentiment: 45 },
  { time: "10m", sentiment: 30 },
  { time: "15m", sentiment: 40 },
  { time: "20m", sentiment: 65 },
  { time: "25m", sentiment: 70 },
];
const keyMetricsData = [
  { metric: "Speaking Pace", value: 165, ideal: 150, fullMark: 200 },
  { metric: "Filler Words", value: 12, ideal: 5, fullMark: 20 },
  { metric: "Interruptions", value: 3, ideal: 2, fullMark: 10 },
  { metric: "Question Ratio", value: 8, ideal: 10, fullMark: 15 },
];

// --- CUSTOM TOOLTIP (Same as before) ---
const CustomSentimentTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background border border-border shadow-lg rounded-md">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{`Sentiment: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- RADAR CHART FIX (NEW) ---
// This function wraps long labels in the Radar Chart
const renderPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
  const parts = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        {...rest}
        dy={parts.length > 1 ? 0 : 4} // Adjust vertical position
        textAnchor={x > cx ? "start" : "end"}
        fill="hsl(var(--foreground))"
        fontSize={12}
      >
        {/* Create a tspan for each word to allow line breaks */}
        {parts.map((part: string, index: number) => (
          <tspan key={index} x={0} dy={index === 0 ? 0 : 15}>
            {part}
          </tspan>
        ))}
      </text>
    </g>
  );
};
// ----------------------------

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  return (
    <DashboardLayout>
      <div className="min-h-screen w-full bg-[#f8f7f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
          {/* Header Section */}
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
                Product Strategy Meeting
              </h1>
              <p className="text-muted-foreground flex items-center gap-4 mt-1">
                <span>January 15, 2024</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  45 minutes
                </span>
              </p>
            </div>
          </div>

          {/* --- RESPONSIVE GRID LAYOUT (NEW) --- */}
          {/* This grid handles all the card placements */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Talk Time Distribution (LG: 2 cols) */}
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

            {/* AI Summary (LG: 3 cols) */}
            <Card className="lg:col-span-3 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>AI Summary</CardTitle>
                <CardDescription>Conversation overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 leading-relaxed">
                <p>
                  Productive strategy meeting focused on Q1 product roadmap.
                  Team aligned on key initiatives: improving AI caption accuracy
                  (92% → 97%), expanding language support (Spanish, French,
                  German), and optimizing battery usage by 40%. Clear ownership
                  and prioritization were established.
                </p>
                <div>
                  <p className="text-sm font-medium mb-2">Key Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Q1 Roadmap",
                      "ML Accuracy",
                      "Language Expansion",
                      "Battery Optimization",
                      "Timeline",
                    ].map((topic) => (
                      <Badge key={topic} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Items (LG: 3 cols) */}
            <Card className="lg:col-span-3 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>
                  Tasks identified during meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    task: "Research ML models",
                    assigned: "AI Team",
                    due: "Jan 22",
                  },
                  {
                    task: "Create language timeline",
                    assigned: "Product",
                    due: "Jan 20",
                  },
                  {
                    task: "Battery optimization tests",
                    assigned: "Hardware",
                    due: "Jan 25",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 bg-accent/30 rounded-lg border border-border/30"
                  >
                    <div className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1 accent-primary" />
                      <div className="flex-1">
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Assigned to: {item.assigned} • Due: {item.due}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Metrics (LG: 2 cols) */}
            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Your Speaking Metrics</CardTitle>
                <CardDescription>Communication performance</CardDescription>
              </CardHeader>
              <CardContent>
                {/* --- FIX: RADAR CHART --- */}
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={keyMetricsData} cx="50%" cy="50%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="metric"
                      // Use the new word-wrapping formatter
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
                {/* ----------------------- */}
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="font-medium">Speaking Pace:</span>
                    <span className="font-bold text-foreground">
                      165 WPM (Ideal: 140-160)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Filler Words:</span>
                    <span className="font-bold text-foreground">
                      12 ("um", "like", "uh")
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Longest Monologue:</span>
                    <span className="font-bold text-foreground">
                      2 min 30 sec
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Over Time (LG: 5 cols) */}
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

            {/* Transcript (LG: 5 cols) */}
            <Card className="lg:col-span-5 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Full Conversation Transcript
                </CardTitle>
                <CardDescription>
                  Speaker-tagged full transcript
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        00:00
                      </span>
                      <span className="text-sm font-semibold">
                        Sarah (Product Lead)
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                      Good morning everyone. Thanks for joining today's strategy
                      meeting.
                    </p>
                  </div>
                  {/* ... Add more transcript items here ... */}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* --- END OF RESPONSIVE GRID --- */}
        </div>
      </div>
    </DashboardLayout>
  );
}
