import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({
  label,
  value,
  delta,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {Icon && (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[#0037FF]">
          <Icon size={15} />
        </div>
      )}
    </div>
    <div className="mt-3 text-2xl font-bold tracking-tight">{value}</div>
    {delta && (
      <div
        className={cn(
          "mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
          trend === "down"
            ? "bg-destructive/10 text-destructive"
            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        )}
      >
        {trend === "down" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
        {delta}
      </div>
    )}
  </div>
);

export default StatCard;
