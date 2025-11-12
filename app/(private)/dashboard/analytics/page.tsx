"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, Clock } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface Conversation {
  id: string;
  title: string;
  date: string;
  duration: string;
  wordCount: number;
  sentiment: "positive" | "neutral" | "negative";
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Product Strategy Meeting",
    date: "2024-01-15",
    duration: "45 min",
    wordCount: 3420,
    sentiment: "positive",
  },
  {
    id: "2",
    title: "Client Presentation",
    date: "2024-01-14",
    duration: "60 min",
    wordCount: 4150,
    sentiment: "positive",
  },
  {
    id: "3",
    title: "Team Standup",
    date: "2024-01-13",
    duration: "15 min",
    wordCount: 980,
    sentiment: "neutral",
  },
  {
    id: "4",
    title: "Design Review",
    date: "2024-01-12",
    duration: "30 min",
    wordCount: 2100,
    sentiment: "positive",
  },
];

export default function AnalyticsPage() {
  const router = useRouter();
  const [conversations] = useState<Conversation[]>(mockConversations);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "neutral":
        return "bg-muted text-muted-foreground border-border";
      case "negative":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            View and analyze your past conversations
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversations
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversations.length}</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Words</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {conversations
                  .reduce((acc, conv) => acc + conv.wordCount, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">37 min</div>
              <p className="text-xs text-muted-foreground mt-1">
                Per conversation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Past Conversations</CardTitle>
            <CardDescription>
              Click on a conversation to view detailed analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() =>
                  router.push(`/dashboard/conversation/${conversation.id}`)
                }
                className="p-4 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-foreground">
                    {conversation.title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={getSentimentColor(conversation.sentiment)}
                  >
                    {conversation.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{conversation.date}</span>
                  <span>•</span>
                  <span>{conversation.duration}</span>
                  <span>•</span>
                  <span>{conversation.wordCount.toLocaleString()} words</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
