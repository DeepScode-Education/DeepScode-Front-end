import { cn } from "@/lib/utils";
import type { LiveClassStatus } from "../types/liveClass.types";

export const StatusBadge = ({ status }: { status: LiveClassStatus }) => {
  const styles: Record<LiveClassStatus, string> = {
    live: "bg-red-50 text-red-600",
    scheduled: "bg-blue-50 text-[#0037FF]",
    ended: "bg-secondary text-muted-foreground",
    cancelled: "bg-secondary text-muted-foreground line-through",
  };
  const labels: Record<LiveClassStatus, string> = {
    live: "Live",
    scheduled: "Upcoming",
    ended: "Ended",
    cancelled: "Cancelled",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", styles[status])}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />}
      {labels[status]}
    </span>
  );
};