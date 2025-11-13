"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react"; // Changed icon to a checkmark for action items

interface ActionItemsProps {
  todos: any[];
  className?: string; // Added className prop for layout flexibility
}

export default function ActionItems({ todos, className }: ActionItemsProps) {
  return (
    // 1. Accept className to allow the parent to control height (flex-grow)
    <Card
      className={`shadow-sm border border-border/50 bg-[#fefdfc] flex flex-col ${className}`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Action Items & Next Steps
        </CardTitle>
        <CardDescription>
          Key takeaways and follow-up points extracted from the discussion
        </CardDescription>
      </CardHeader>

      {/* 2. Added flex-grow so content pushes down if needed */}
      <CardContent className="flex-grow">
        {todos && todos.length > 0 ? (
          // 3. Changed from grid to flex-col for vertical stacking
          <div className="flex flex-col gap-3 h-full">
            {todos.map((item, index) => (
              <div
                key={index}
                // 4. Full width row styling with better padding
                className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                {/* Small visual bullet point */}
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary/60 flex-shrink-0" />

                <p className="text-sm text-foreground font-medium leading-relaxed">
                  {typeof item === "object" ? JSON.stringify(item) : item}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground italic">
              No action items found.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
