import { ReactNode } from "react";

interface StatusBadgeProps {
  children?: ReactNode;
  tone?: "default" | "neutral" | "warning" | "danger" | "success";
}

const toneClasses = {
  default: "bg-secondary text-secondary-foreground",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function StatusBadge({ children, tone }: StatusBadgeProps) {
  // If no children and no tone, render nothing
  if (!children && !tone) return null;

  // Determine tone from children if not explicitly provided
  let finalTone = tone;
  if (!finalTone && typeof children === "string") {
    const lower = children.toLowerCase();
    if (lower === "active" || lower === "published") finalTone = "success";
    else if (lower === "draft" || lower === "pending") finalTone = "warning";
    else if (lower === "archived" || lower === "inactive") finalTone = "neutral";
    else if (lower === "deleted") finalTone = "danger";
    else finalTone = "default";
  }

  const className = `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses[finalTone || "default"]}`;

  return <span className={className}>{children || "—"}</span>;
}