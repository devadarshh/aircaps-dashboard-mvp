export interface Conversation {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: string[];
  actionItems: number;
  status: "ready" | "processing";
  talkRatio?: {
    you: number;
    others: number;
    label: string;
  };
}

export interface ActionItem {
  id: string;
  text: string;
  conversationTitle: string;
  completed: boolean;
}
