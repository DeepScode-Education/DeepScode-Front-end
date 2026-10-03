
import { Mic, MicOff, Video, VideoOff, Crown, X, ScreenShare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZoomParticipant } from "../hooks/useZoomParticipants";

/**
 * Breakpoint at which this panel switches from a mobile drawer/overlay to
 * a persistent in-flow column. "md" (768px) is the default, matching the
 * mobile/desktop cutover used across the Live Classroom shell.
 */
type PanelBreakpoint = "md" | "lg" | "xl";

const PERSISTENT_VISIBLE_CLASS: Record<PanelBreakpoint, string> = {
  md: "md:block",
  lg: "lg:block",
  xl: "xl:block",
};

const DRAWER_HIDDEN_CLASS: Record<PanelBreakpoint, string> = {
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

interface ParticipantPanelProps {
  participants: ZoomParticipant[];
  activeSpeakerId: number | null;
  open: boolean;
  onClose: () => void;
  /** true renders this as a persistent in-flow column instead of a drawer */
  persistent: boolean;
  /** Keep the close affordance when a persistent panel is user-toggleable. */
  showClose?: boolean;
  /** Render the drawer inside LiveClassShell's own bounding box (needed so
   * it stays correctly positioned during browser fullscreen). */
  contained?: boolean;
  /** Breakpoint at which the persistent column replaces the drawer. */
  drawerBreakpoint?: PanelBreakpoint;
  /** Called when a participant row is tapped/clicked — used to promote
   * that participant's video/share to the main stage. */
  onSelectParticipant?: (userId: number) => void;
  /** Currently promoted-to-main-stage participant, if any. */
  selectedUserId?: number | null;
  /** UserId who is actively sharing screen, if any. */
  activeShareId?: number | null;
}

const ParticipantRow = ({
  p,
  isActiveSpeaker,
  isSharing,
  selected,
  onSelect,
}: {
  p: ZoomParticipant;
  isActiveSpeaker: boolean;
  isSharing: boolean;
  selected?: boolean;
  onSelect?: (userId: number) => void;
}) => (
  <div
    onClick={() => onSelect?.(p.userId)}
    role={onSelect ? "button" : undefined}
    tabIndex={onSelect ? 0 : undefined}
    onKeyDown={(e) => {
      if (onSelect && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSelect(p.userId);
      }
    }}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
      selected
        ? "bg-white/10 ring-1 ring-cyan-400/30"
        : isActiveSpeaker
        ? "bg-[#0037FF]/15 ring-1 ring-[#0037FF]/40"
        : "hover:bg-white/5",
      onSelect ? "cursor-pointer" : ""
    )}
  >
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
        p.isHost ? "bg-[#0037FF]/25 ring-1 ring-[#0037FF]/50" : "bg-white/10"
      )}
    >
      {p.displayName.slice(0, 2).toUpperCase()}
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-white">
        {p.displayName}
        {p.isSelf && <span className="text-white/50"> (You)</span>}
      </p>
      <p className="flex flex-wrap items-center gap-x-1.5 text-xs text-white/50">
        {p.isHost && (
          <span className="inline-flex items-center gap-1 text-amber-400">
            <Crown size={11} /> Host
          </span>
        )}
        {!p.isHost && p.isCoHost && "Co-host"}
        {!p.isHost && !p.isCoHost && "Student"}
        {isActiveSpeaker && <span className="text-[#6b8bff]">· Speaking</span>}
        {isSharing && (
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <ScreenShare size={11} /> Presenting
          </span>
        )}
      </p>
    {/* show presenting badge if this participant is the active share */}
    {p.userId === (typeof ("" as any) === "string" ? undefined : undefined) ? null : null}
    </div>
    <div className="flex shrink-0 items-center gap-1.5 text-white/60">
      {p.muted ? <MicOff size={15} className="text-red-400" /> : <Mic size={15} />}
      {p.videoOn ? <Video size={15} /> : <VideoOff size={15} className="text-white/30" />}
    </div>
  </div>
);

export const ParticipantPanel = ({
  participants,
  activeSpeakerId,
  open,
  onClose,
  persistent,
  showClose = false,
  contained = false,
  drawerBreakpoint = "md",
  onSelectParticipant,
  selectedUserId,
  activeShareId,
}: ParticipantPanelProps) => {
  const body = (
    <div
      className="flex h-full w-full flex-col bg-[#111318]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">
          Participants <span className="text-white/40">({participants.length})</span>
        </h3>
        {(!persistent || showClose) && (
          <button
            onClick={onClose}
            aria-label="Close participants"
            title="Close participants"
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {participants.length === 0 ? (
          <p className="p-4 text-center text-xs text-white/40">Waiting for participants…</p>
        ) : (
          participants
            .slice()
            .sort((a, b) => Number(b.isHost) - Number(a.isHost))
            .map((p) => (
              <ParticipantRow
                key={p.userId}
                p={p}
                isActiveSpeaker={p.userId === activeSpeakerId}
                isSharing={p.userId === activeShareId}
                selected={p.userId === selectedUserId}
                onSelect={onSelectParticipant}
              />
            ))
        )}
      </div>
      {onSelectParticipant && (
        <p className="border-t border-white/10 px-4 py-2 text-[11px] text-white/35">
          Tap a participant to pin their view on the main stage.
        </p>
      )}
    </div>
  );

  if (persistent) {
    return (
      <aside
        className={cn(
          "hidden h-full w-72 shrink-0 border-r border-white/10",
          PERSISTENT_VISIBLE_CLASS[drawerBreakpoint]
        )}
      >
        {body}
      </aside>
    );
  }

  return (
    <div
      className={cn(
        contained ? "absolute inset-0 z-30" : "fixed inset-0 z-[10001]",
        "transition-opacity",
        DRAWER_HIDDEN_CLASS[drawerBreakpoint],
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Participants"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Bottom sheet on phones, right-side drawer from sm up */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[65dvh] max-h-[65dvh] transform rounded-t-2xl transition-transform duration-200",
          "sm:bottom-auto sm:left-auto sm:right-0 sm:top-0 sm:h-full sm:max-h-full sm:w-[min(24rem,85vw)] sm:rounded-none",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full"
        )}
      >
        {body}
      </div>
    </div>
  );
};