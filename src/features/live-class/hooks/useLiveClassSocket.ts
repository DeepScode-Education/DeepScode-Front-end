

// import { useEffect, useRef, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { getToken, getAdminToken } from "@/integrations/client";

// const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
// const BASE_URL = VITE_API_BASE?.trim() || "https://slateserver1.onrender.com";

// /** Broadcast payload for the raise-hand feature (see registerLiveClassSockets
//  * on the backend — requires a small server-side addition, see PR notes). */
// export interface HandRaisedPayload {
//   liveClassId: string;
//   userName: string;
//   raised: boolean;
// }

// export interface ChatMessagePayload {
//   liveClassId: string;
//   userName: string;
//   message: string;
// }

// interface SocketEvents {
//   onMeetingStarted?: (data: { liveClassId: string }) => void;
//   onMeetingEnded?: (data: { liveClassId: string }) => void;
//   onStudentJoined?: (data: { userId: string }) => void;
//   onStudentLeft?: (data: { userId: string }) => void;
//   /** Real shared raise-hand state — fired for every participant's toggle,
//    * including our own echoed back by the server (kept idempotent by the
//    * caller, which stores hand state in a Set keyed by userName). */
//   onHandRaised?: (data: HandRaisedPayload) => void;
//   onChatMessage?: (data: ChatMessagePayload) => void;
// }

// /**
//  * Connects to the Socket.IO `/live` namespace already registered on the
//  * backend (registerLiveClassSockets). Joins the given liveClassId room and
//  * wires up the event handlers passed in.
//  */
// export function useLiveClassSocket(liveClassId: string | null, events: SocketEvents) {
//   const socketRef = useRef<Socket | null>(null);
//   const [connected, setConnected] = useState(false);
//   // Keep the latest event callbacks in a ref so socket listeners registered
//   // once per liveClassId never close over stale versions of the handlers.
//   const eventsRef = useRef(events);
//   eventsRef.current = events;

//   useEffect(() => {
//     if (!liveClassId) return;

//     const token = getToken() ?? getAdminToken();
//     if (!token) return;

//     const socket = io(`${BASE_URL}/live`, {
//       auth: { token },
//       transports: ["websocket"],
//     });
//     socketRef.current = socket;

//     socket.on("connect", () => {
//       setConnected(true);
//       socket.emit("join-room", { liveClassId });
//     });

//     socket.on("disconnect", () => setConnected(false));
//     socket.on("meeting-started", (data) => eventsRef.current.onMeetingStarted?.(data));
//     socket.on("meeting-ended", (data) => eventsRef.current.onMeetingEnded?.(data));
//     socket.on("student-joined", (data) => eventsRef.current.onStudentJoined?.(data));
//     socket.on("student-left", (data) => eventsRef.current.onStudentLeft?.(data));
//     socket.on("hand-raised", (data: HandRaisedPayload) => eventsRef.current.onHandRaised?.(data));
//     socket.on("chat-message", (data: ChatMessagePayload) => eventsRef.current.onChatMessage?.(data));

//     return () => {
//       socket.emit("leave-room", { liveClassId });
//       socket.disconnect();
//       socketRef.current = null;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [liveClassId]);

//   /** Broadcasts a raise/lower-hand toggle to everyone else in the room. */
//   const emitRaiseHand = (payload: HandRaisedPayload) => {
//     socketRef.current?.emit("raise-hand", payload);
//   };

//   const emitChatMessage = (payload: ChatMessagePayload) => {
//     socketRef.current?.emit("chat-message", payload);
//   };

//   return { connected, emitRaiseHand, emitChatMessage };
// }






import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getToken, getAdminToken } from "@/integrations/client";

const VITE_API_BASE = import.meta.env.VITE_API_BASE as string | undefined;
const BASE_URL = VITE_API_BASE?.trim() || "https://slateserver1.onrender.com";

/** Broadcast payload for the raise-hand feature (see registerLiveClassSockets
 * on the backend — requires a small server-side addition, see PR notes). */
export interface HandRaisedPayload {
  liveClassId: string;
  userName: string;
  raised: boolean;
}

export interface ChatMessagePayload {
  liveClassId: string;
  userName: string;
  message: string;
  senderId?: string;
  sentAt?: number;
}

interface SocketEvents {
  onMeetingStarted?: (data: { liveClassId: string }) => void;
  onMeetingEnded?: (data: { liveClassId: string }) => void;
  onStudentJoined?: (data: { userId: string }) => void;
  onStudentLeft?: (data: { userId: string }) => void;
  /** Real shared raise-hand state — fired for every participant's toggle,
   * including our own echoed back by the server (kept idempotent by the
   * caller, which stores hand state in a Set keyed by userName). */
  onHandRaised?: (data: HandRaisedPayload) => void;
  onChatMessage?: (data: ChatMessagePayload) => void;
}

/**
 * Connects to the Socket.IO `/live` namespace already registered on the
 * backend (registerLiveClassSockets). Joins the given liveClassId room and
 * wires up the event handlers passed in.
 */
export function useLiveClassSocket(liveClassId: string | null, events: SocketEvents) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  // Keep the latest event callbacks in a ref so socket listeners registered
  // once per liveClassId never close over stale versions of the handlers.
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    if (!liveClassId) return;

    const token = getToken() ?? getAdminToken();
    if (!token) return;

    const socket = io(`${BASE_URL}/live`, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", { liveClassId });
    });

    socket.on("disconnect", () => setConnected(false));
    socket.on("meeting-started", (data) => eventsRef.current.onMeetingStarted?.(data));
    socket.on("meeting-ended", (data) => eventsRef.current.onMeetingEnded?.(data));
    socket.on("student-joined", (data) => eventsRef.current.onStudentJoined?.(data));
    socket.on("student-left", (data) => eventsRef.current.onStudentLeft?.(data));
    socket.on("hand-raised", (data: HandRaisedPayload) => eventsRef.current.onHandRaised?.(data));
    socket.on("chat-message", (data: ChatMessagePayload) => eventsRef.current.onChatMessage?.(data));

    return () => {
      socket.emit("leave-room", { liveClassId });
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveClassId]);

  /** Broadcasts a raise/lower-hand toggle to everyone else in the room. */
  const emitRaiseHand = (payload: HandRaisedPayload) => {
    socketRef.current?.emit("raise-hand", payload);
  };

  const emitChatMessage = (payload: ChatMessagePayload) => {
    socketRef.current?.emit("chat-message", payload);
  };

  return { connected, emitRaiseHand, emitChatMessage };
}