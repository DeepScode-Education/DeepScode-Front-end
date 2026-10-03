/**
 * src/features/live-class/components/PresentingIndicator.tsx
 *
 * The small "Amit Sir is presenting" label that sits over the bottom-left
 * corner of the main stage (see reference designs). Swaps its icon/verb
 * based on whether the teacher is sharing a screen or just on camera, and
 * turns green while actively screen-sharing per the spec's color system
 * ("Green screen-share active state").
 */
import { ScreenShare, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface PresentingIndicatorProps {
  mentorName: string;
  isScreenSharing: boolean;
  className?: string;
}

export const PresentingIndicator = ({
  mentorName,
  isScreenSharing,
  className,
}: PresentingIndicatorProps) => {
  return (
    <div
      className={cn(
        "pointer-events-none flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white shadow-md backdrop-blur-sm sm:text-xs",
        isScreenSharing ? "bg-emerald-600/90" : "bg-black/60",
        className
      )}
    >
      {isScreenSharing ? <ScreenShare size={13} /> : <Video size={13} />}
      <span className="max-w-[55vw] truncate sm:max-w-xs">
        {isScreenSharing ? `${mentorName} is presenting` : `${mentorName}`}
      </span>
    </div>
  );
};