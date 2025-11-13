"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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

const getToneColor = (tone?: string) => {
  switch (tone?.toLowerCase()) {
    case "constructive":
    case "collaborative":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "inquisitive":
    case "curious":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "empathetic":
    case "personal":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200";
    case "casual":
    case "banter":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
    case "tense":
    case "conflict":
      return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    case "instructional":
    case "educational":
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    case "transactional":
      return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
  }
};

interface Conversation {
  id: string;
  title: string;
  date: string;
  tone?: string;
  status: "ready" | "processing";
  actionItems: number;
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

  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [actionItems, setActionItems] = useState<ActionItem[]>(mockActionItems);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [loadingWords, setLoadingWords] = useState(true);
  const [loadingActionItems, setLoadingActionItems] = useState(true);

  const [talkListenRatio, setTalkListenRatio] = useState<{
    avgTalk: string;
    avgListen: string;
    message: string;
  } | null>(null);
  const [loadingRatio, setLoadingRatio] = useState(true);

  useEffect(() => {
    const fetchActionItems = async () => {
      try {
        setLoadingActionItems(true);
        const res = await axios.get("/api/analysis/actionItems");
        setActionItems(res.data.actionItems);
      } catch (err) {
        console.error("Failed to fetch action items:", err);
      } finally {
        setLoadingActionItems(false);
      }
    };
    fetchActionItems();
  }, []);

  useEffect(() => {
    const fetchTotalWords = async () => {
      try {
        setLoadingWords(true);
        const res = await axios.get("/api/analysis/totalWords");
        setTotalWords(res.data.totalWords);
      } catch (err) {
        console.error("Failed to fetch total words:", err);
      } finally {
        setLoadingWords(false);
      }
    };
    fetchTotalWords();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        const res = await axios.get("/api/analysis/recent");
        setConversations(res.data.conversations);
      } catch (err) {
        console.error("Failed to fetch conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
    const fetchTalkListenRatio = async () => {
      try {
        setLoadingRatio(true);
        const res = await axios.get("/api/analysis/talkListenRatio");
        setTalkListenRatio(res.data);
      } catch (err) {
        console.error("Failed to fetch talk/listen ratio:", err);
      } finally {
        setLoadingRatio(false);
      }
    };
    fetchTalkListenRatio();
  }, []);

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

        <Card className="border-primary/20 hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
          <CardHeader>
            <CardTitle className="text-2xl">My Pending Action Items</CardTitle>
            <CardDescription>
              Your to-do list from all conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loadingActionItems ? (
                <div className="flex justify-center py-6">
                  <ClipLoader color="#4f46e5" size={28} />
                </div>
              ) : actionItems.filter((item) => !item.completed).length > 0 ? (
                actionItems
                  .filter((item) => !item.completed)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() =>
                          setActionItems((prev) =>
                            prev.map((todo) =>
                              todo.id === item.id
                                ? { ...todo, completed: !todo.completed }
                                : todo
                            )
                          )
                        }
                        className="mt-0.5 cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="text-foreground">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          from: {item.conversationTitle}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No pending action items. Great work!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Time */}
            <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
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
                  <div className="flex flex-col items-center justify-center h-[60px]">
                    <ClipLoader
                      color="#4f46e5"
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

            <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Talk/Listen Ratio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRatio ? (
                  <div className="flex flex-col items-center justify-center h-[60px]">
                    <ClipLoader
                      color="#4f46e5"
                      size={28}
                      speedMultiplier={0.8}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Fetching data...
                    </p>
                  </div>
                ) : talkListenRatio ? (
                  <>
                    <div className="text-3xl font-bold text-foreground">
                      {talkListenRatio.avgTalk} / {talkListenRatio.avgListen}
                    </div>
                    <p className="text-sm text-primary mt-2">
                      {talkListenRatio.message}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    No data available
                  </p>
                )}
              </CardContent>
            </Card>
            {/* Total Conversations */}
            <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Conversations (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {conversations.length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  vs. 19 last week
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Words (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingWords ? (
                  <div className="flex flex-col items-center justify-center h-[60px]">
                    <ClipLoader
                      color="#4f46e5"
                      size={28}
                      speedMultiplier={0.8}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Fetching data...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-foreground">
                      {totalWords?.toLocaleString() || 0}
                    </div>
                    <p className="text-sm text-primary mt-2">
                      +20% from last week
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Conversations */}
        <Card className="hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
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
                className="text-sm font-medium cursor-pointer"
              >
                View All
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-0">
            {loadingConversations ? (
              <div className="flex justify-center items-center py-10">
                <ClipLoader color="#4f46e5" size={35} />
              </div>
            ) : (
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
                        Tone
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
                        onClick={() =>
                          router.push(`/dashboard/conversation/${c.id}`)
                        }
                        className="border-border/20 hover:bg-muted/30 hover:shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
                      >
                        <TableCell className="pl-6 font-medium text-foreground">
                          {c.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {c.date}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`capitalize ${getToneColor(
                              c.tone
                            )} cursor-pointer`}
                          >
                            {c.tone || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center pr-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/dashboard/conversation/${c.id}`);
                            }}
                            className="text-sm font-medium hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsClientPage;
