/**
 * src/features/live-class/components/ChatDrawer.tsx
 *
 * Per spec section 5 ("Chat Behaviour"): chat never permanently occupies
 * classroom space. Two render modes, chosen by the caller (LiveClassShell)
 * based on viewport:
 *
 *   variant="overlay" — mobile portrait. Full-height/bottom-sheet overlay
 *                        that floats OVER the stage. Stage width is
 *                        untouched while this is open.
 *
 *   variant="panel"   — tablet, desktop, mobile landscape. A real flex
 *                        sibling of the main stage (not `position:
 *                        absolute`), so the stage resizes smoothly when
 *                        this opens/closes, per "the main content should
 *                        resize smoothly".
 *
 * In both cases the drawer is only ever shown while `open` is true —
 * closing it always hands the full stage back immediately.
 */
import { useEffect, useRef, useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ZoomChatMessage } from "../hooks/useZoomChat";

interface ChatDrawerProps {
  messages: ZoomChatMessage[];
  onSend: (text: string) => void;
  open: boolean;
  onClose: () => void;
  variant: "overlay" | "panel";
  className?: string;
}

export const ChatDrawer = ({ messages, onSend, open, onClose, variant, className }: ChatDrawerProps) => {
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(id);
  }, [open]);

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
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0037FF] text-white hover:bg-[#0037FF]/90 disabled:opacity-40"
          disabled={!draft.trim()}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );

  if (variant === "panel") {
    // In-flow flex sibling — 0 width when closed so it animates smoothly
    // and never overlaps the stage, non-null width when open.
    return (
      <aside
        className={cn(
          "h-full shrink-0 overflow-hidden border-l border-white/10 transition-[width] duration-200 ease-out",
          open ? "w-full max-w-[380px] sm:w-[340px] lg:w-[380px]" : "w-0"
        )}
        aria-hidden={!open}
      >
        <div className="h-full w-full min-w-[280px] sm:min-w-[340px] lg:min-w-[380px]">{body}</div>
      </aside>
    );
  }

  // variant === "overlay" (mobile portrait)
  return (
    <div
      className={cn(
        "fixed inset-0 z-[10001] transition-opacity",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Chat"
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