/**
 * src/features/live-class/components/LiveClassHeader.tsx
 *
 * Top bar for the redesigned Live Classroom. Matches the reference
 * designs: back/close chevron, class name, red LIVE badge, running
 * duration, connection-quality bars, and Chat / Participants buttons
 * (each shows an unread/count badge and highlights while its drawer is
 * open).
 *
 * Purely presentational — every value is passed in as a prop. No Zoom SDK
 * or session-state logic lives here, so this component is safe to restyle
 * independently of the classroom's connection logic.
 */
import { ChevronDown, MessageSquare, Users, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ElapsedTimer } from "./ElapsedTimer";

export type ConnectionQuality = "good" | "poor" | "disconnected";

interface LiveClassHeaderProps {
  title: string;
  isLive: boolean;
  startedAt: Date | null;
  connectionQuality: ConnectionQuality;
  onBack: () => void;

  chatOpen: boolean;
  onToggleChat: () => void;
  unreadChat: number;

  participantsOpen: boolean;
  onToggleParticipants: () => void;
  participantCount: number;

  /** Hidden below md — chat/participants buttons only render inline on
   * mobile where there's no persistent side column to click into instead. */
  showPanelButtons?: boolean;
}

const ConnectionBadge = ({ quality }: { quality: ConnectionQuality }) => {
  if (quality === "disconnected") {
    return (
    <span className="hidden items-center gap-1 text-[10px] font-medium text-red-400 sm:flex">
        <WifiOff size={12} />
        <span className="hidden sm:inline">Reconnecting…</span>
      </span>
    );
  }
  return (
    <span
      className={cn(
        "hidden items-center gap-1 text-[10px] font-medium sm:flex",
        quality === "good" ? "text-emerald-400" : "text-amber-400"
      )}
      title={quality === "good" ? "Connection: good" : "Connection: unstable"}
    >
      <Wifi size={12} />
    </span>
  );
};

const HeaderIconButton = ({
  active,
  onClick,
  label,
  badge,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
    className={cn(
      "relative flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs",
      active ? "bg-white/20 text-white" : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
    )}
  >
    {children}
    <span className="hidden sm:inline">{label}</span>
    {!!badge && (
      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
);

export const LiveClassHeader = ({
  title,
  isLive,
  startedAt,
  connectionQuality,
  onBack,
  chatOpen,
  onToggleChat,
  unreadChat,
  participantsOpen,
  onToggleParticipants,
  participantCount,
  showPanelButtons = true,
}: LiveClassHeaderProps) => {
  return (
    <header
      className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-b from-black/50 to-black/20 px-2.5 py-2 backdrop-blur-sm sm:px-4 sm:py-3"
      style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
    >
      {/* Left: back + title + live status */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ChevronDown size={18} className="rotate-90" />
        </button>

        <div className="flex min-w-0 flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-semibold text-white sm:text-sm">{title}</span>
            {isLive && (
              <span className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white bg-red-600 sm:text-[10px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <ElapsedTimer startedAt={startedAt} />
            </span>
            <ConnectionBadge quality={connectionQuality} />
          </div>
        </div>
      </div>

      {/* Right: chat / participants */}
      {showPanelButtons && (
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HeaderIconButton active={chatOpen} onClick={onToggleChat} label="Chat" badge={unreadChat}>
            <MessageSquare size={16} />
          </HeaderIconButton>
          <HeaderIconButton
            active={participantsOpen}
            onClick={onToggleParticipants}
            label="Participants"
          >
            <Users size={16} />
            <span className="sr-only">{participantCount} participants</span>
          </HeaderIconButton>
        </div>
      )}
    </header>
  );
};