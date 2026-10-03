/**
 * src/features/live-class/components/ParticipantsDrawer.tsx
 *
 * Per spec section 6 ("Participants Behaviour"): shows name, host/teacher
 * indicator, mic state, and raise-hand state where available. Explicitly
 * NEVER shows participant video tiles — that's the whole point of this
 * being a Live Class, not a gallery (spec section 9).
 *
 * Same overlay/panel duality as ChatDrawer — see that file's header
 * comment for the reasoning.
 */
import { cn } from "@/lib/utils";
import { Mic, MicOff, Crown, X, Hand } from "lucide-react";
import type { ZoomParticipant } from "../hooks/useZoomParticipants";

interface ParticipantsDrawerProps {
  participants: ZoomParticipant[];
  activeSpeakerId: number | null;
  raisedHandIds?: Set<number>;
  open: boolean;
  onClose: () => void;
  variant: "overlay" | "panel";
  className?: string;
}

const ParticipantRow = ({
  p,
  isActiveSpeaker,
  handRaised,
}: {
  p: ZoomParticipant;
  isActiveSpeaker: boolean;
  handRaised: boolean;
}) => (
  <div
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
      isActiveSpeaker ? "bg-[#0037FF]/15 ring-1 ring-[#0037FF]/40" : "hover:bg-white/5"
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
            <Crown size={11} /> Teacher
          </span>
        )}
        {!p.isHost && "Student"}
        {isActiveSpeaker && <span className="text-[#6b8bff]">· Speaking</span>}
      </p>
    </div>
    <div className="flex shrink-0 items-center gap-2 text-white/60">
      {handRaised && (
        <span title="Hand raised" className="text-amber-400">
          <Hand size={15} />
        </span>
      )}
      {p.muted ? <MicOff size={15} className="text-red-400" /> : <Mic size={15} />}
    </div>
  </div>
);

export const ParticipantsDrawer = ({
  participants,
  activeSpeakerId,
  raisedHandIds,
  open,
  onClose,
  variant,
  className,
}: ParticipantsDrawerProps) => {
  const body = (
    <div className="flex h-full w-full flex-col bg-[#111318]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">
          Participants <span className="text-white/40">({participants.length})</span>
        </h3>
        <button
          onClick={onClose}
          aria-label="Close participants"
          className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
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
                handRaised={!!raisedHandIds?.has(p.userId)}
              />
            ))
        )}
      </div>
    </div>
  );

  if (variant === "panel") {
    return (
      <aside
        className={cn(
          "h-full shrink-0 overflow-hidden border-r border-white/10 transition-[width] duration-200 ease-out",
          open ? "w-full max-w-[320px] sm:w-[300px] lg:w-[320px]" : "w-0"
        )}
        aria-hidden={!open}
      >
        <div className="h-full w-full min-w-[260px] sm:min-w-[300px] lg:min-w-[320px]">{body}</div>
      </aside>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[10001] transition-opacity",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Participants"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 flex h-[60dvh] max-h-[60dvh] transform flex-col rounded-t-2xl transition-transform duration-200",
          className,
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {body}
      </div>
    </div>
  );
};