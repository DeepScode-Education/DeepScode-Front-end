import { Info, Briefcase, CreditCard, CheckCircle2, Settings, Eye, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { STEPS, StepKey } from "./types";
import { StepErrors } from "./validation";

const ICONS: Record<StepKey, typeof Info> = {
  basic: Info,
  role: Briefcase,
  compensation: CreditCard,
  eligibility: CheckCircle2,
  settings: Settings,
  review: Eye,
};

interface CreateJobSidebarProps {
  activeIndex: number;
  onSelect: (index: number) => void;
  errorsByStep: Partial<Record<StepKey, StepErrors>>;
}

const CreateJobSidebar = ({ activeIndex, onSelect, errorsByStep }: CreateJobSidebarProps) => (
  <div className="w-60 shrink-0">
    <nav className="space-y-1">
      {STEPS.map((step, index) => {
        const Icon = ICONS[step.key];
        const active = index === activeIndex;
        const hasError = Object.keys(errorsByStep[step.key] ?? {}).length > 0;

        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-[#0037FF]/10 font-medium text-[#0037FF]" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon size={15} />
            {step.label}
            {hasError && <AlertTriangle size={12} className="ml-auto text-destructive" />}
          </button>
        );
      })}
    </nav>
  </div>
);

export default CreateJobSidebar;
