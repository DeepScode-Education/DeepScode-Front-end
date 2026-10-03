/**
 * src/features/live-class/components/MainStage.tsx
 *
 * The largest area of the classroom, following the required priority:
 *
 *   Teacher Screen Share  >  Teacher Camera  >  Classroom Placeholder
 *
 * IMPORTANT ARCHITECTURE NOTE — read before "splitting" this further:
 * The Zoom Meeting SDK Embedded Client renders camera video AND screen
 * share into a single internal canvas that it owns and manages itself
 * (see ZoomMeetingRoom.tsx / LiveClassShell's existing addPin/
 * removeAllPins + setViewType calls, which already implement this
 * priority at the SDK level). There is no public API on this SDK build to
 * pull the camera feed and the share feed into two independently
 * addressable DOM elements, so `TeacherVideoStage` and `ScreenShareStage`
 * below are intentionally thin, state-driven wrappers around that same
 * single canvas rather than two separate video elements — splitting them
 * further would mean re-implementing a feature the SDK doesn't expose and
 * would break the working, hardened join/share pipeline in
 * ZoomMeetingRoom.tsx.
 *
 * What this component DOES fully own and separate out, per the state
 * architecture requirement, is the *presentation layer*: which of the
 * three priority states we're currently in, the presenter label, and the
 * placeholder — all driven by props from LiveClassShell, never by
 * touching the SDK directly.
 */
import { forwardRef } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PresentingIndicator } from "./PresentingIndicator";
import { ClassroomPlaceholder } from "./ClassroomPlaceholder";

export type ActivePresenter = "screen-share" | "camera" | "none";

interface MainStageProps {
  activePresenter: ActivePresenter;
  mentorName: string;
  /** The SDK's own canvas (ZoomMeetingRoom, hideOwnChrome) — always
   * mounted so the live session is never interrupted, regardless of
   * activePresenter. Hidden visually (not unmounted) behind the
   * placeholder when activePresenter === "none". */
  children: React.ReactNode;
  className?: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

/**
 * TeacherVideoStage — semantic marker for the "camera" priority tier.
 * Renders nothing of its own; the SDK canvas underneath is already
 * showing the camera feed by this point in the priority chain. Exists so
 * the state architecture (activePresenter) has a matching, named
 * component per the "Create reusable components" requirement, and so
 * future SDK versions that DO expose a separate camera element have a
 * clear seam to plug into.
 */
export const TeacherVideoStage = () => null;

/**
 * ScreenShareStage — semantic marker for the "screen-share" priority
 * tier. Same rationale as TeacherVideoStage above.
 */
export const ScreenShareStage = () => null;

export const MainStage = forwardRef<HTMLDivElement, MainStageProps>(
  ({ activePresenter, mentorName, children, className, isFullscreen, onToggleFullscreen }, ref) => {
    const showPlaceholder = activePresenter === "none";

    return (
      <div
        ref={ref}
        className={cn(
          "relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-none bg-black transition-shadow duration-200 sm:rounded-2xl",
          activePresenter === "screen-share" && "ring-1 ring-emerald-500/40",
          className
        )}
      >
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
            className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        )}

        {/* SDK canvas — always mounted, never unmounted by priority changes. */}
        <div className={cn("absolute inset-0", showPlaceholder && "opacity-0")}>{children}</div>

        {showPlaceholder && <ClassroomPlaceholder mentorName={mentorName} />}

        {!showPlaceholder && (
          <PresentingIndicator
            mentorName={mentorName}
            isScreenSharing={activePresenter === "screen-share"}
            className="absolute bottom-3 left-3 z-20 sm:bottom-4 sm:left-4"
          />
        )}
      </div>
    );
  }
);

MainStage.displayName = "MainStage";