import { useState } from "react";
import { format, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * DatePicker
 * ─────────────────────────────────────────────────────────────────────────
 * A single, consistent shadcn/ui (Calendar + Popover) date-selection
 * component to be reused across the app — replaces raw
 * `<input type="date" />` fields.
 *
 * - Stores/emits the value as "YYYY-MM-DD" (same contract as native
 *   `<input type="date">`), so it drops into existing state (`useState`)
 *   and API payloads without changing any calling code beyond the JSX.
 * - Displays the selected date as a readable "12 Sep 2026" format.
 * - Supports disabling past or future dates, or an explicit min/max range,
 *   so each usage can enforce its own business rule (e.g. due dates can't
 *   be in the past; a payment date can't be in the future).
 */

interface DatePickerProps {
  /** Selected value as "YYYY-MM-DD", or "" for no selection. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Disable all dates strictly before today. */
  disablePast?: boolean;
  /** Disable all dates strictly after today. */
  disableFuture?: boolean;
  /** Disable all dates before this explicit date. */
  minDate?: Date;
  /** Disable all dates after this explicit date. */
  maxDate?: Date;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  /** Shown next to the trigger label; defaults to a calendar icon. */
  showIcon?: boolean;
  align?: "start" | "center" | "end";
}

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  // Parse as local time to avoid the classic UTC off-by-one-day shift.
  const d = new Date(`${value}T00:00:00`);
  return isValid(d) ? d : undefined;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disablePast = false,
  disableFuture = false,
  minDate,
  maxDate,
  className,
  triggerClassName,
  disabled,
  showIcon = true,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate = parseValue(value);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateDisabled = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (disablePast && d < today) return true;
    if (disableFuture && d > today) return true;
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (d < min) return true;
    }
    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (d > max) return true;
    }
    return false;
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date || isDateDisabled(date)) return;
    onChange(toDateString(date));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-9 justify-start gap-2 border-border bg-background font-normal text-left text-sm text-foreground hover:bg-secondary/40",
            !selectedDate && "text-muted-foreground",
            open && "border-[#0037FF] ring-2 ring-[#0037FF]/20",
            triggerClassName,
            className
          )}
        >
          {showIcon && <CalendarIcon size={14} className="shrink-0 text-[#0037FF]" />}
          <span className="truncate">
            {selectedDate ? format(selectedDate, "d MMM yyyy") : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        {/* <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={isDateDisabled}
          defaultMonth={selectedDate ?? today}
          initialFocus
        /> */}

        <Calendar
  mode="single"
  selected={selectedDate}
  onSelect={handleSelect}
  disabled={isDateDisabled}
  defaultMonth={selectedDate ?? today}
  initialFocus
  classNames={{
    day_selected:
      "!bg-[#0037FF] !text-white hover:!bg-[#0037FF] hover:!text-white focus:!bg-[#0037FF] focus:!text-white",
    day_today: "bg-[#0037FF]/10 text-[#0037FF] font-semibold",
  }}
/>
      </PopoverContent>
    </Popover>
  );
}