import AnalyticsClientPage from "@/components/Dashboard/AnalyticsClientPage";
import { getTotalTimeLast7Days } from "@/lib/action/analytics";
import { Conversation } from "@/types/analytics";

const mockActionItems = [
  {
    id: "1",
    text: "Follow up with Michael about the Q4 budget",
    conversationTitle: "Project Sync",
    completed: false,
  },
  {
    id: "2",
    text: "Send the design mockups to the client by EOD Friday",
    conversationTitle: "Client Call",
    completed: false,
  },
  {
    id: "3",
    text: "Book team dinner reservations",
    conversationTitle: "1:1 with Sarah",
    completed: false,
  },
];

const mockConversations: Conversation[] = [
  {
    id: "1",
    title: "Product Strategy Meeting",
    date: "Nov 12, 2025",
    duration: "45 min",
    participants: ["You", "Michael", "Sarah"],
    actionItems: 3,
    status: "ready",
    talkRatio: { you: 62, others: 38, label: "You spoke more" },
  },
  {
    id: "2",
    title: "Client Call - Q4 Review",
    date: "Nov 11, 2025",
    duration: "62 min",
    participants: ["You", "Client Team", "Mark", "Lisa", "Tom"],
    actionItems: 0,
    status: "processing",
  },
];

export default async function AnalyticsPage() {
  const totalTime = await getTotalTimeLast7Days();
  console.log("total Time", totalTime);

  return (
    <AnalyticsClientPage
      totalTimeLast7Days={totalTime}
      mockActionItems={mockActionItems}
      mockConversations={mockConversations}
    />
  );
}
