/**
 * src/features/live-class/hooks/useZoomChat.ts
 *
 * FIX (verified against the installed @zoom/meetingsdk embedded.d.ts,
 * v6.2.0): `client.getChatClient()` does NOT exist on the EmbeddedClient
 * namespace — there is no separate chat sub-client in this SDK build.
 * Chat is sent directly on the top-level client:
 *
 *   client.sendChat(message: string, userId?: number): Promise<ChatMessage | Error>
 *
 * Receiving is unchanged — `chat-on-message` was already the correct,
 * documented event and its payload shape (sender.name, sender.userId,
 * message, timestamp) already matched what this hook expected.
 *
 * The previous "optimistic local echo" (manually pushing a `You` message
 * after calling the fake chat client) has been removed. Per Zoom's docs,
 * `chat-on-message` fires for the sender's own messages as well as
 * everyone else's, so keeping the manual push would have shown every
 * sent message twice. `isSelf` is now derived the same way
 * useZoomParticipants derives it — comparing the event's sender.userId
 * against client.getCurrentUser().userId.
 *
 * Opening/closing the chat UI never touches this hook's subscriptions —
 * it keeps listening in the background so the unread badge works even
 * while ChatPanel is closed.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export interface ZoomChatMessage {
  id: string;
  senderName: string;
  senderId: number;
  text: string;
  timestamp: number;
  isSelf: boolean;
}

export function useZoomChat(clientRef: React.MutableRefObject<any>, isOpen: boolean) {
  const [messages, setMessages] = useState<ZoomChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const selfIdRef = useRef<number | null>(null);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    // getCurrentUser() is synchronous — NOT getCurrentUserInfo(), which
    // does not exist on this client. Resolve it once up front so the
    // first incoming message can already be correctly flagged as isSelf.
    try {
      const me = client.getCurrentUser?.();
      if (me?.userId != null) selfIdRef.current = me.userId;
    } catch {
      // Not ready yet — fall back to resolving lazily inside onMessage below.
    }

    const onMessage = (payload: any) => {
      if (selfIdRef.current == null) {
        try {
          const me = client.getCurrentUser?.();
          if (me?.userId != null) selfIdRef.current = me.userId;
        } catch {
          /* ignore */
        }
      }

      const senderId = payload?.sender?.userId;
      const isSelf = selfIdRef.current != null && senderId === selfIdRef.current;
      const text = Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message ?? "";

      const msg: ZoomChatMessage = {
        id: payload?.id || `${payload?.timestamp}-${senderId}`,
        senderName: payload?.sender?.name || "Participant",
        senderId,
        text,
        timestamp: payload?.timestamp || Date.now(),
        isSelf,
      };
      setMessages((prev) => [...prev, msg]);
      if (!isOpen && !isSelf) setUnreadCount((c) => c + 1);
    };

    client.on("chat-on-message", onMessage);
    return () => client.off?.("chat-on-message", onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientRef.current]);

  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const sendMessage = useCallback(
    (text: string) => {
      const client = clientRef.current;
      const trimmed = text.trim();
      if (!client || !trimmed) return;

      // sendChat() is the real, documented top-level method — there is no
      // separate chat sub-client to fetch first. It resolves with the sent
      // ChatMessage (or an Error), but we don't need to touch the result:
      // chat-on-message already fires for our own sent messages above, so
      // the message will render from that single source of truth.
      client.sendChat?.(trimmed)?.catch?.((err: any) => {
        console.warn("[Zoom][Chat] sendChat failed:", err);
      });
    },
    [clientRef]
  );

  return { messages, unreadCount, sendMessage };
}