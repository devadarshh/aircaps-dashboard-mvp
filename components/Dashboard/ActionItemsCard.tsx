"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export interface ActionItem {
  id: string;
  text: string;
  conversationTitle: string;
  completed: boolean;
}

interface Props {
  actionItems: ActionItem[];
  loading: boolean;
  toggleActionItem: (id: string) => void;
}

const ActionItemsCard = ({ actionItems, loading, toggleActionItem }: Props) => {
  return (
    <Card className="border-primary/20 hover:shadow-md hover:scale-[1.01] transition-all duration-200 ease-in-out cursor-pointer">
      {loading ? (
        <div className="p-4 space-y-3">
          <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {[...Array(3)].map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-12 rounded-lg bg-gray-300 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <CardHeader>
            <CardTitle className="text-2xl">My Pending Action Items</CardTitle>
            <CardDescription>
              Your to-do list from all conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {actionItems.filter((item) => !item.completed).length > 0 ? (
                actionItems
                  .filter((item) => !item.completed)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleActionItem(item.id)}
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
        </>
      )}
    </Card>
  );
};

export default ActionItemsCard;
