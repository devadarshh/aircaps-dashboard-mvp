"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

// Mock data
const sentimentData = [
  { time: "0-10min", positive: 65, neutral: 25, negative: 10 },
  { time: "10-20min", positive: 70, neutral: 20, negative: 10 },
  { time: "20-30min", positive: 80, neutral: 15, negative: 5 },
  { time: "30-40min", positive: 75, neutral: 20, negative: 5 },
  { time: "40-50min", positive: 85, neutral: 10, negative: 5 },
];

const engagementData = [
  { time: "0-10min", engagement: 75 },
  { time: "10-20min", engagement: 82 },
  { time: "20-30min", engagement: 88 },
  { time: "30-40min", engagement: 85 },
  { time: "40-50min", engagement: 90 },
];

interface ConversationDetailPageProps {
  params: { id: string };
}

export default function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
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
              Product Strategy Meeting
            </h1>
            <p className="text-muted-foreground">
              January 15, 2024 • 45 minutes
            </p>
          </div>
        </div>

        {/* Full Conversation Transcript */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-light">
              Full Conversation
            </CardTitle>
            <CardDescription>
              Complete transcript of the conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {/* Add your transcript blocks here */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    00:00
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    Sarah (Product Lead)
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                  Good morning everyone. Thanks for joining today's strategy
                  meeting. Let's discuss our Q1 product roadmap and key
                  priorities.
                </p>
              </div>
              {/* ...other transcript items */}
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground leading-relaxed">
              Productive strategy meeting focused on Q1 product roadmap. Team
              aligned on three key initiatives: enhancing AI caption accuracy,
              expanding language support, and improving battery efficiency.
              Strong consensus on prioritization with clear action items
              assigned.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline">Roadmap Planning</Badge>
              <Badge variant="outline">Feature Prioritization</Badge>
              <Badge variant="outline">Team Alignment</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Action Items
              </CardTitle>
              <CardDescription>
                Key tasks identified during conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-accent/50 rounded-lg">
                <p className="font-medium text-foreground mb-1">
                  Research ML models for accuracy improvement
                </p>
                <p className="text-sm text-muted-foreground">
                  Assigned to: AI Team • Due: Jan 22
                </p>
              </div>
              {/* ...other action items */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Improvements
              </CardTitle>
              <CardDescription>Suggestions for better outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">
                    Meeting Structure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Consider adding time for Q&A at the end
                  </p>
                </div>
              </div>
              {/* ...other improvements */}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Conversation tone over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sentimentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Bar
                    dataKey="positive"
                    stackId="a"
                    fill="hsl(142, 71%, 45%)"
                  />
                  <Bar dataKey="neutral" stackId="a" fill="hsl(var(--muted))" />
                  <Bar dataKey="negative" stackId="a" fill="hsl(0, 84%, 60%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Level</CardTitle>
              <CardDescription>
                Participation and interaction metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={engagementData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
