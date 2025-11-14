"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react"; 

interface ActionItemsProps {
  todos: any[];
  className?: string; 
}

export default function ActionItems({ todos, className }: ActionItemsProps) {
  return (
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

      <CardContent className="grow">
        {todos && todos.length > 0 ? (
          <div className="flex flex-col gap-3 h-full">
            {todos.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary/60 shrink-0" />

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
