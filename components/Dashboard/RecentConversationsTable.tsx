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
import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  onDelete?: (id: string) => void;
}

const RecentConversationsTable = ({
  conversations,
  loading,
  getToneColor,
  onDelete,
}: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/analysis/${deletingId}`);
      toast({
        title: "Conversation deleted",
        description: "The conversation has been successfully removed.",
      });
      if (onDelete) {
        onDelete(deletingId);
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
      toast({
        title: "Error",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

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
            <TableHead className="w-40 text-center font-semibold text-sm text-muted-foreground pr-6">
              Actions
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
                <div className="flex items-center justify-center gap-2">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(c.id);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center sm:items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl">Delete Conversation</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                Are you sure you want to delete this conversation? This action
                cannot be undone and all analysis data will be permanently
                removed.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Conversation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecentConversationsTable;
