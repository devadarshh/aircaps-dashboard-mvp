"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  id: string;
  title: string;
  date: string;
  tone?: string;
}

interface Props {
  conversations: Conversation[];
  loading: boolean;
  getToneColor: (tone?: string) => string;
}

const RecentConversationsTable = ({
  conversations,
  loading,
  getToneColor,
}: Props) => {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="loader"></div>
      </div>
    );
  }

  return (
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
              onClick={() => router.push(`/dashboard/conversation/${c.id}`)}
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
  );
};

export default RecentConversationsTable;
