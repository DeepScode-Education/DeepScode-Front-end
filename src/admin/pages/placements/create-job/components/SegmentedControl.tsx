import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const SegmentedControl = ({ options, value, onChange }: SegmentedControlProps) => (
  <div className="inline-flex rounded-md border border-input bg-muted/40 p-0.5">
    {options.map((opt) => {
      const Icon = opt.icon;
      const active = value === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-1.5 rounded-sm px-3.5 py-1.5 text-sm transition-colors",
            active
              ? "bg-background text-[#0037FF] font-medium shadow-sm border border-[#0037FF]/20"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {Icon && <Icon size={13} />}
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default SegmentedControl;
