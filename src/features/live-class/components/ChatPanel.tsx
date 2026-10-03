
import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZoomChatMessage } from "../hooks/useZoomChat";

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

interface ChatPanelProps {
  messages: ZoomChatMessage[];
  onSend: (text: string) => void;
  open: boolean;
  onClose: () => void;
  persistent: boolean;
  /** Keep the close affordance when a persistent panel is user-toggleable. */
  showClose?: boolean;
  /** Render the drawer inside LiveClassShell's own bounding box (needed so
   * it stays correctly positioned during browser fullscreen). */
  contained?: boolean;
  /** Breakpoint at which a sibling persistent panel replaces this drawer. */
  drawerBreakpoint?: PanelBreakpoint;
}

export const ChatPanel = ({
  messages,
  onSend,
  open,
  onClose,
  persistent,
  showClose = false,
  contained = false,
  drawerBreakpoint = "md",
}: ChatPanelProps) => {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  // When the drawer opens on a touch device, avoid auto-focusing the input
  // immediately — that pops the keyboard before the open animation settles
  // and causes a visible layout jump. A short delay lets the sheet finish
  // sliding in first.
  useEffect(() => {
    if (!open || persistent) return;
    const id = setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    }, 220);
    return () => clearTimeout(id);
  }, [open, persistent]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
    inputRef.current?.focus();
  };

  const body = (
    <div className="flex h-full w-full flex-col bg-[#111318]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Chat</h3>
        {(!persistent || showClose) && (
          <button
            onClick={onClose}
            aria-label="Close chat"
            title="Close chat"
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="p-4 text-center text-xs text-white/40">No messages yet — say hello 👋</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex flex-col", m.isSelf ? "items-end" : "items-start")}>
              <span className="mb-0.5 text-[11px] text-white/40">{m.isSelf ? "You" : m.senderName}</span>
              <span
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-1.5 text-sm",
                  m.isSelf ? "bg-[#0037FF] text-white" : "bg-white/10 text-white"
                )}
              >
                {m.text}
              </span>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={submit}
        className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message everyone…"
          aria-label="Chat message"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#0037FF] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Send message"
          title="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0037FF] text-white hover:bg-[#0037FF]/90 disabled:opacity-40"
          disabled={!draft.trim()}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  if (persistent) {
    return (
      <aside
        className={cn(
          "hidden h-full w-80 shrink-0 border-l border-white/10",
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
      aria-label="Chat"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* Bottom sheet on small screens (60-70dvh), right drawer from sm up */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 flex h-[65dvh] max-h-[65dvh] transform flex-col rounded-t-2xl transition-transform duration-200",
          "sm:bottom-0 sm:right-0 sm:left-auto sm:top-0 sm:h-full sm:max-h-full sm:w-[380px] sm:max-w-[85vw] sm:rounded-none",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full"
        )}
      >
        {body}
      </div>
    </div>
  );
};