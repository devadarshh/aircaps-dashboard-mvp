"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import ActionItemsCard from "./ActionItemsCard";
import InsightCard from "./InsightCard";
import RecentConversationsTable from "./RecentConversationsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { getToneColor } from "@/utils/getToneColor";

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
  totalTimeLast7Days?: string;
}

const AnalyticsClientPage = ({
  totalTimeLast7Days,
}: AnalyticsClientPageProps) => {
  const router = useRouter();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [talkListenRatio, setTalkListenRatio] = useState<string | null>(null);
  const [totalWords, setTotalWords] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [actionRes, convRes, talkListenRes, totalWordsRes] =
          await Promise.all([
            axios.get("/api/analysis/actionItems"),
            axios.get("/api/analysis/recent"),
            axios.get("/api/analysis/talkListenRatio"),
            axios.get("/api/analysis/totalWords"),
          ]);

        const formattedActionItems = (
          actionRes.data.actionItems as {
            text: string;
            conversationTitle: string;
          }[]
        ).map((item, index) => ({
          id: `todo-${index}`,
          text: item.text,
          conversationTitle: item.conversationTitle,
          completed: false,
        }));

        setActionItems(formattedActionItems);
        setConversations(convRes.data.conversations || []);

        if (talkListenRes.data) {
          const avgTalk = talkListenRes.data.avgTalk ?? 0;
          const avgListen = talkListenRes.data.avgListen ?? 0;
          setTalkListenRatio(`${avgTalk} / ${avgListen}`);
        } else {
          setTalkListenRatio("0 / 0");
        }
        if (totalWordsRes.data) {
          setTotalWords(totalWordsRes.data.totalWords || 0);
        }
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleActionItem = (id: string) => {
    setActionItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 space-y-8">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <tbody>
                {[...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td>
                      <Skeleton className="h-8 mb-2 rounded" />
                    </td>
                    <td>
                      <Skeleton className="h-8 mb-2 rounded" />
                    </td>
                    <td>
                      <Skeleton className="h-8 mb-2 rounded" />
                    </td>
                    <td>
                      <Skeleton className="h-8 mb-2 rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8 bg-[#e9e6e2]">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Track action items, insights, and conversation history
          </p>
        </div>

        <ActionItemsCard
          actionItems={actionItems}
          loading={false}
          toggleActionItem={toggleActionItem}
        />

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InsightCard
              title="Total Time (Last 7 Days)"
              value={totalTimeLast7Days || "0"}
              subText={totalTimeLast7Days ? "+15% from last week" : ""}
              loading={false}
            />
            <InsightCard
              title="Avg. Talk/Listen Ratio"
              value={talkListenRatio || "0 / 0"}
              subText={talkListenRatio ? "Talk more than last week" : ""}
              loading={false}
            />
            <InsightCard
              title="Total Conversations (Last 7 Days)"
              value={conversations.length > 0 ? conversations.length : 0}
              subText={
                conversations.length > 0
                  ? `vs. ${Math.max(conversations.length - 1, 0)} last week`
                  : ""
              }
              loading={false}
            />
            <InsightCard
              title="Total Words (Last 7 Days)"
              value={totalWords ?? 0}
              subText={totalWords > 0 ? "+20% from last week" : ""}
              loading={false}
            />
          </div>
        </div>

        <RecentConversationsTable
          conversations={conversations}
          loading={false}
          getToneColor={getToneColor}
        />
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsClientPage;
