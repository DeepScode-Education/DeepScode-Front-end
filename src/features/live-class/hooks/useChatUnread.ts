/**
 * src/features/live-class/hooks/useChatUnread.ts
 *
 * Replaces useZoomChat.ts. The Video SDK UI Toolkit's own chat panel
 * (mounted via uitoolkit.showChatComponent) now owns message list state,
 * rendering, and sending — there is no public "get unread count" API on
 * the toolkit, so we track it ourselves the same way the old hook did:
 * count "chat-on-message" events while the drawer is closed, and clear
 * the count when it opens. ZoomVideoClass already subscribes to
 * "chat-on-message" internally (to wire showChatComponent); this hook
 * just needs its own subscription for the badge, since the two concerns
 * (mounting the panel vs. counting unread) are independent.
 */
import { useEffect, useState } from "react";
import { loadZoomUIToolkit } from "../utils/loadZoomUIToolkit";

export function useChatUnread(isOpen: boolean, sessionActive: boolean) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!sessionActive) return;
    let active = true;
    const onMessage = () => {
      if (!isOpen) setUnreadCount((c) => c + 1);
    };

    const subscribe = async () => {
      try {
        const { default: uitoolkit } = await loadZoomUIToolkit();
        if (!active) return;
        uitoolkit.on("chat-on-message", onMessage);
      } catch {
        /* ignore */
      }
    };

    void subscribe();
    return () => {
      active = false;
      const unsubscribe = async () => {
        try {
          const { default: uitoolkit } = await loadZoomUIToolkit();
          uitoolkit.off("chat-on-message", onMessage);
        } catch {
          /* ignore */
        }
      };
      void unsubscribe();
    };
  }, [isOpen, sessionActive]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  return unreadCount;
}