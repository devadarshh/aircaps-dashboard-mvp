"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";

interface Conversation {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  actionItems: number;
  status: "ready" | "processing";
  talkRatio?: { you: number; others: number; label: string };
}

interface ActionItem {
  id: string;
  text: string;
  conversationTitle: string;
  completed: boolean;
}

interface AnalyticsClientPageProps {
  totalTimeLast7Days: string;
  mockActionItems: ActionItem[];
  mockConversations: Conversation[];
}

const AnalyticsClientPage = ({
  totalTimeLast7Days,
  mockActionItems,
  mockConversations,
}: AnalyticsClientPageProps) => {
  const router = useRouter();
  const [conversations] = useState(mockConversations);
  const [actionItems, setActionItems] = useState(mockActionItems);

  const toggleActionItem = (id: string) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 bg-[#e9e6e2]">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track action items, insights, and conversation history
          </p>
        </div>

        {/* Action Items */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">My Pending Action Items</CardTitle>
            <CardDescription>
              Your to-do list from all conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {actionItems
                .filter((item) => !item.completed)
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleActionItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        from: {item.conversationTitle}
                      </p>
                    </div>
                  </div>
                ))}
              {actionItems.filter((item) => !item.completed).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No pending action items. Great work!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Time (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalTimeLast7Days ? (
                  <>
                    <div className="text-3xl font-bold text-foreground">
                      {totalTimeLast7Days}
                    </div>
                    <p className="text-sm text-primary mt-2">
                      +15% from last week
                    </p>
                  </>
                ) : (
                  // ✅ Loader state
                  <div className="flex flex-col items-center justify-center h-[60px]">
                    <ClipLoader
                      color="#4f46e5" // your theme’s indigo-600
                      size={28}
                      speedMultiplier={0.8}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Fetching data...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Talk/Listen Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  45% / 55%
                </div>
                <p className="text-sm text-primary mt-2">
                  You are listening 5% more. Great!
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Conversations (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">22</div>
                <p className="text-sm text-muted-foreground mt-2">
                  vs. 19 last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">28 min</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your longest was 75 min (Project Sync)
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Conversations */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  Recent Conversations
                </CardTitle>
                <CardDescription>
                  View your latest meetings and generated insights
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-sm font-medium"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 bg-muted/30">
                    <TableHead className="pl-6 font-semibold text-sm text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-center text-muted-foreground">
                      Action Items
                    </TableHead>
                    <TableHead className="w-28 text-center font-semibold text-sm text-muted-foreground pr-6">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border/20 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="pl-6 font-medium text-foreground">
                        {c.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {c.date}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.status === "ready" ? (
                          <Badge variant="secondary" className="font-medium">
                            {c.actionItems} Pending
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            Processing
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/dashboard/conversation/${c.id}`)
                          }
                          disabled={c.status === "processing"}
                          className={`text-sm font-medium ${
                            c.status === "ready"
                              ? "hover:bg-primary hover:text-primary-foreground"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {c.status === "ready" ? "View Details" : "Processing"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsClientPage;
