// import { useEffect, useRef, useState, useCallback } from "react";
// import {
//   Maximize2,
//   Minimize2,
//   Expand,
//   Shrink,
//   Mic,
//   MicOff,
//   Volume2,
//   Users,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { JoinLiveClassPayload } from "@/integrations/client";

// // ── Debug logging helpers (INSTRUMENTED — purely additive) ─────────────────
// const TAG = "[ZoomMeetingRoom]";

// const zlog = (...args: any[]) => {
//   // eslint-disable-next-line no-console
//   console.log(`%c${TAG}`, "color:#0037FF;font-weight:bold;", ...args);
// };
// const zwarn = (...args: any[]) => {
//   // eslint-disable-next-line no-console
//   console.warn(`%c${TAG}`, "color:#d97706;font-weight:bold;", ...args);
// };
// const zerror = (label: string, err: any) => {
//   // eslint-disable-next-line no-console
//   console.error(`%c${TAG} ❌ ${label} FAILED`, "color:#dc2626;font-weight:bold;font-size:12px;");
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   message:`, err?.message);
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   name:`, err?.name);
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   code:`, err?.code ?? err?.errorCode);
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   reason:`, err?.reason);
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   stack:`, err?.stack);
//   // eslint-disable-next-line no-console
//   console.error(`${TAG}   raw error object:`, err);
// };
// const logUserState = (client: any, label = "current user state") => {
//   try {
//     const me = client?.getCurrentUser?.();
//     zlog(`📋 ${label}:`, me);
//   } catch (e) {
//     zwarn(`Could not read user state for "${label}":`, e);
//   }
// };

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface ZoomMeetingRoomProps {
//   joinInfo: JoinLiveClassPayload;
//   userName: string;
//   role: "mentor" | "student";
//   onLeave: () => void;
//   onJoined?: () => void;
//   onError?: (message: string) => void;
//   _persistentMode?: boolean;
//   _clientRef?: React.MutableRefObject<any>;
//   _endingByUserRef?: React.MutableRefObject<boolean>;
//   _minimized?: boolean;
//   hideOwnChrome?: boolean;
//   _containerRef?: React.RefObject<HTMLDivElement>;
//   onMicStateChange?: (on: boolean) => void;
//   onCameraStateChange?: (on: boolean) => void;
//   onShareStateChange?: (isSharing: boolean) => void;
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// type ViewMode = "compact" | "expanded";
// export type AudioStatus = "idle" | "connected" | "muted" | "blocked" | "unknown";

// interface ParticipantAudio {
//   userId: number;
//   displayName: string;
//   audioStatus: AudioStatus;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export const ZoomMeetingRoom = ({
//   joinInfo,
//   userName,
//   role,
//   onLeave,
//   onJoined,
//   onError,
//   _persistentMode = false,
//   _clientRef,
//   _endingByUserRef,
//   _minimized = false,
//   hideOwnChrome = false,
//   _containerRef,
//   onMicStateChange,
//   onCameraStateChange,
//   onShareStateChange,
// }: ZoomMeetingRoomProps) => {
//   const wrapperRef = useRef<HTMLDivElement>(null);
//   const internalContainerRef = useRef<HTMLDivElement>(null);
//   const containerRef = _containerRef ?? internalContainerRef;

//   const [error, setError] = useState<string | null>(null);
//   const [joining, setJoining] = useState(true);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [viewMode, setViewMode] = useState<ViewMode>("compact");

//   const [myAudioStatus, setMyAudioStatus] = useState<AudioStatus>("idle");
//   const [showJoinAudioHint, setShowJoinAudioHint] = useState(false);
//   const [participants, setParticipants] = useState<ParticipantAudio[]>([]);
//   const [showParticipantAudio, setShowParticipantAudio] = useState(false);

//   // ── Layout helpers ──────────────────────────────────────────────────────────

//   const isSelfDispatchedResizeRef = useRef(false);

//   const nudgeResize = useCallback(() => {
//     requestAnimationFrame(() => {
//       isSelfDispatchedResizeRef.current = true;
//       window.dispatchEvent(new Event("resize"));
//       isSelfDispatchedResizeRef.current = false;
//     });
//   }, []);

//   const nudgeResizeBurst = useCallback(() => {
//     nudgeResize();
//     setTimeout(nudgeResize, 150);
//     setTimeout(nudgeResize, 500);
//   }, [nudgeResize]);

//   // StrictMode-safe guard — true only once a join has fully completed.
//   const hasJoinedRef = useRef(false);
//   const internalClientRef = useRef<any>(null);
//   const currentUserIdRef = useRef<number | null>(null);
//   const myAudioStatusRef = useRef<AudioStatus>("idle");

//   useEffect(() => {
//     myAudioStatusRef.current = myAudioStatus;
//   }, [myAudioStatus]);

//   const setClient = useCallback(
//     (client: any) => {
//       internalClientRef.current = client;
//       if (_clientRef) _clientRef.current = client;
//     },
//     [_clientRef]
//   );

//   // ── Fullscreen ──────────────────────────────────────────────────────────────

//   const enterFullscreen = useCallback(async () => {
//     const el = wrapperRef.current;
//     if (!el) return;
//     try {
//       if (el.requestFullscreen) await el.requestFullscreen();
//       else if ((el as any).webkitRequestFullscreen)
//         await (el as any).webkitRequestFullscreen();
//     } catch (err) {
//       zerror("enterFullscreen", err);
//     }
//   }, []);

//   const exitFullscreen = useCallback(async () => {
//     try {
//       if (document.fullscreenElement) await document.exitFullscreen();
//       else if ((document as any).webkitFullscreenElement)
//         await (document as any).webkitExitFullscreen();
//     } catch (err) {
//       zerror("exitFullscreen", err);
//     }
//   }, []);

//   const toggleFullscreen = useCallback(() => {
//     if (isFullscreen) exitFullscreen();
//     else enterFullscreen();
//   }, [isFullscreen, enterFullscreen, exitFullscreen]);

//   useEffect(() => {
//     // Ignore resize events we dispatched ourselves — see the
//     // `isSelfDispatchedResizeRef` comment above `nudgeResize` for why this
//     // is required, not optional. Without it, this single line is the
//     // entire freeze: every resize re-schedules another one, forever.
//     const handleResize = () => {
//       if (isSelfDispatchedResizeRef.current) return;
//       nudgeResize();
//     };
//     window.addEventListener("orientationchange", handleResize);
//     window.addEventListener("resize", handleResize);

//     let vvTimer: ReturnType<typeof setTimeout> | null = null;
//     const handleVisualViewport = () => {
//       if (vvTimer) clearTimeout(vvTimer);
//       vvTimer = setTimeout(handleResize, 60);
//     };
//     window.visualViewport?.addEventListener("resize", handleVisualViewport);
//     window.visualViewport?.addEventListener("scroll", handleVisualViewport);

//     let ro: ResizeObserver | null = null;
//     if (containerRef.current && "ResizeObserver" in window) {
//       ro = new ResizeObserver(() => handleResize());
//       ro.observe(containerRef.current);
//     }

//     return () => {
//       window.removeEventListener("orientationchange", handleResize);
//       window.removeEventListener("resize", handleResize);
//       window.visualViewport?.removeEventListener("resize", handleVisualViewport);
//       window.visualViewport?.removeEventListener("scroll", handleVisualViewport);
//       if (vvTimer) clearTimeout(vvTimer);
//       ro?.disconnect();
//     };
//   }, [nudgeResize]);

//   const toggleViewMode = useCallback(() => {
//     setViewMode((prev) => (prev === "compact" ? "expanded" : "compact"));
//     nudgeResize();
//   }, [nudgeResize]);

//   const dismissJoinAudioHint = useCallback(
//     () => setShowJoinAudioHint(false),
//     []
//   );

//   // ── SDK join flow ───────────────────────────────────────────────────────────

//   useEffect(() => {
//     if (hasJoinedRef.current) return;

//     let cancelled = false;
//     const isCancelled = () => cancelled;

//     const waitForContainerSize = (timeoutMs = 8000) =>
//       new Promise<void>((resolve, reject) => {
//         const startedAt = Date.now();
//         const check = () => {
//           if (isCancelled()) {
//             reject(new Error("CANCELLED"));
//             return;
//           }
//           const el = containerRef.current;
//           if (el && el.clientWidth > 0 && el.clientHeight > 0) {
//             resolve();
//             return;
//           }
//           if (Date.now() - startedAt > timeoutMs) {
//             reject(new Error("CONTAINER_TIMEOUT"));
//             return;
//           }
//           requestAnimationFrame(check);
//         };
//         check();
//       });

//     const waitForConnected = (c: any) =>
//       new Promise<void>((resolve) => {
//         let done = false;
//         const finish = () => {
//           if (done) return;
//           done = true;
//           resolve();
//         };
//         c.on("connection-change", (payload: { state: string }) => {
//           zlog("📡 SDK event connection-change (join flow):", payload);
//           if (payload.state === "Connected") finish();
//         });
//         setTimeout(finish, 1500);
//       });

//     const applyViewType = async (c: any) => {
//       zlog("⚙️ applyViewType: calling c.setViewType('speaker')");
//       try {
//         await c.setViewType?.("speaker");
//         zlog("✅ setViewType('speaker') succeeded");
//       } catch (err) {
//         zwarn("setViewType('speaker') rejected on this device, falling back to 'gallery'. Error:", err);
//         try {
//           await c.setViewType?.("gallery");
//           zlog("✅ setViewType('gallery') fallback succeeded");
//         } catch (fallbackErr) {
//           zerror("applyViewType — setViewType('gallery') fallback", fallbackErr);
//         }
//       }
//     };

//     (async () => {
//       let client: any;
//       try {
//         // ── Browser permission handling ─────────────────────────────────────

//         try {
//           const micPerm = await navigator.permissions?.query({
//             name: "microphone" as PermissionName,
//           });
//           const camPerm = await navigator.permissions?.query({
//             name: "camera" as PermissionName,
//           });
//           zlog("🔐 Permission states at join — microphone:", micPerm?.state, "| camera:", camPerm?.state);
//           if (
//             micPerm?.state === "denied" ||
//             camPerm?.state === "denied"
//           ) {
//             throw new Error(
//               "Camera or microphone access is blocked in your browser. " +
//                 "Click the camera icon in the address bar, allow access, then refresh."
//             );
//           }
//         } catch (permCheckErr: any) {
//           zwarn("Permission pre-check threw (Permissions API may be unsupported):", permCheckErr);
//           if (
//             permCheckErr instanceof Error &&
//             permCheckErr.message.includes("blocked")
//           ) {
//             throw permCheckErr;
//           }
//         }

//         try {
//           zlog("⚙️ Testing mic access via getUserMedia({ audio: true }) ...");
//           const testStream = await navigator.mediaDevices.getUserMedia({
//             audio: true,
//           });
//           testStream.getTracks().forEach((t) => t.stop());
//           zlog("✅ getUserMedia mic test succeeded");
//         } catch (micErr: any) {
//           zerror("getUserMedia mic pre-test", micErr);
//           const msg = (micErr?.message || "").toLowerCase();
//           if (
//             msg.includes("denied") ||
//             micErr?.name === "NotAllowedError"
//           ) {
//             throw new Error(
//               "Microphone access was blocked. Click the camera/mic icon in " +
//                 "your browser's address bar, allow access, then refresh."
//             );
//           }
//           if (micErr?.name === "NotFoundError") {
//             zwarn("No microphone device detected on this machine.");
//           }
//         }

//         if (isCancelled()) return;

//         try {
//           zlog("⚙️ Waiting for container to have real dimensions before SDK init ...");
//           await waitForContainerSize();
//           zlog(
//             "✅ Container ready:",
//             containerRef.current?.clientWidth,
//             "x",
//             containerRef.current?.clientHeight
//           );
//         } catch (containerErr: any) {
//           zerror("waitForContainerSize", containerErr);
//           if (isCancelled()) return;
//           throw new Error("CONTAINER_TIMEOUT");
//         }
//         if (isCancelled()) return;

//         zlog("⚙️ Importing @zoom/meetingsdk/embedded and creating client ...");
//         const { default: ZoomMtgEmbedded } = await import(
//           "@zoom/meetingsdk/embedded"
//         );
//         client = ZoomMtgEmbedded.createClient();
//         setClient(client);
//         zlog("✅ Zoom embedded client created:", client);

//         if (isCancelled() || !containerRef.current) {
//           zwarn("Join cancelled or container missing right after client creation — aborting, no client.init() called.");
//           setClient(null);
//           return;
//         }

//         zlog("⚙️ Calling client.init() ...");
//         await client.init({
//           zoomAppRoot: containerRef.current,
//           language: "en-US",
//           patchJsMedia: true,
//           leaveOnPageUnload: true,
//           customize: {
//             video: {
//               isResizable: true,
//               popper: { disableDraggable: true },
//               defaultViewType: "speaker" as const,
//             },
//           },
//         });
//         zlog("✅ client.init() succeeded");

//         if (isCancelled()) {
//           zwarn("Join cancelled right after init() — calling leaveMeeting() to clean up.");
//           try {
//             client.leaveMeeting?.();
//           } catch (cleanupErr) {
//             zerror("cleanup leaveMeeting() after cancelled init", cleanupErr);
//           }
//           setClient(null);
//           return;
//         }

//         // ── Event listeners (INSTRUMENTED) ──────────────────────────────────

//         client.on(
//           "connection-change",
//           (payload: { state: string }) => {
//             zlog("📡 SDK event connection-change:", payload);
//             if (
//               payload.state === "Closed" ||
//               payload.state === "Fail"
//             ) {
//               if (document.fullscreenElement) {
//                 document.exitFullscreen().catch((e) => zwarn("exitFullscreen on connection Closed/Fail failed:", e));
//               }

//               if (role === "mentor" && !_endingByUserRef?.current) {
//                 zlog("⚙️ Mentor's own connection closed unexpectedly — calling liveClassApi.endClass() as a self-heal.");
//                 import("@/integrations/client")
//                   .then(({ liveClassApi }) =>
//                     liveClassApi.endClass(joinInfo.liveClassId).then(
//                       () => zlog("✅ self-heal endClass() succeeded"),
//                       (endErr) => zerror("self-heal liveClassApi.endClass()", endErr)
//                     )
//                   )
//                   .catch((impErr) => zerror("dynamic import of @/integrations/client for self-heal endClass", impErr));
//               }

//               onLeave();
//             }
//           }
//         );

//         client.on("current-audio-change", (payload: any) => {
//           zlog("📡 SDK event current-audio-change:", payload);
//           const action = payload?.action;
//           if (action === "join") {
//             setMyAudioStatus("connected");
//             setShowJoinAudioHint(false);
//             onMicStateChange?.(true);
//           } else if (action === "leave") {
//             setMyAudioStatus("idle");
//             onMicStateChange?.(false);
//           } else if (action === "muted") {
//             setMyAudioStatus("muted");
//             onMicStateChange?.(false);
//           } else if (action === "unmuted") {
//             setMyAudioStatus("connected");
//             onMicStateChange?.(true);
//           } else {
//             zwarn("current-audio-change: unrecognised action value:", action);
//           }
//         });

//         client.on("active-video-change", (payload: any) => {
//           zlog("📡 SDK event active-video-change:", payload, "| currentUserId:", currentUserIdRef.current);
//           if (
//             currentUserIdRef.current != null &&
//             payload?.userId === currentUserIdRef.current
//           ) {
//             onCameraStateChange?.(
//               !!payload?.state && payload.state !== "Stopped"
//             );
//           }
//         });

//         client.on("active-share-change", (payload: any) => {
//           zlog(
//             "📡 SDK event active-share-change:",
//             payload,
//             "| role:",
//             role,
//             "| currentUser:",
//             currentUserIdRef.current
//           );
//           const state = payload?.state;

//           if (state === "Stopped") {
//             onShareStateChange?.(false);
//             nudgeResizeBurst();
//             return;
//           }

//           if (state === "Active") {
//             onShareStateChange?.(true);
//             nudgeResizeBurst();
//             applyViewType(internalClientRef.current).catch((e) => zerror("applyViewType after active-share-change", e));
//           }
//         });

//         client.on(
//           "user-audio-status-change",
//           (payloadList: any[]) => {
//             zlog("📡 SDK event user-audio-status-change:", payloadList);
//             if (!Array.isArray(payloadList)) return;

//             setParticipants((prev) => {
//               const next = [...prev];
//               for (const item of payloadList) {
//                 const rawStatus = String(
//                   item.audioStatus?.audio ?? item.audioStatus ?? ""
//                 ).toLowerCase();
//                 let status: AudioStatus = "unknown";
//                 if (rawStatus.includes("muted")) status = "muted";
//                 else if (
//                   rawStatus.includes("unmuted") ||
//                   rawStatus.includes("connect")
//                 )
//                   status = "connected";
//                 else if (
//                   rawStatus.includes("none") ||
//                   rawStatus.includes("disconnect")
//                 )
//                   status = "idle";

//                 const existingIdx = next.findIndex(
//                   (p) => p.userId === item.userId
//                 );
//                 const displayName =
//                   existingIdx >= 0
//                     ? next[existingIdx].displayName
//                     : item.displayName || `User ${item.userId}`;
//                 const entry: ParticipantAudio = {
//                   userId: item.userId,
//                   displayName,
//                   audioStatus: status,
//                 };

//                 if (existingIdx >= 0) next[existingIdx] = entry;
//                 else next.push(entry);

//                 if (
//                   currentUserIdRef.current != null &&
//                   item.userId === currentUserIdRef.current
//                 ) {
//                   setMyAudioStatus(
//                     status === "unknown" ? "idle" : status
//                   );
//                 }
//               }
//               return next;
//             });
//           }
//         );

//         zlog("⚙️ Calling client.join() with meetingNumber:", joinInfo.providerMeetingId, "| role:", role);
//         await client.join({
//           signature: joinInfo.signature,
//           meetingNumber: joinInfo.providerMeetingId,
//           password: joinInfo.password || "",
//           userName,
//           ...(role === "mentor" && joinInfo.zak
//             ? { zak: joinInfo.zak }
//             : {}),
//         });
//         zlog("✅ client.join() succeeded");

//         if (isCancelled()) {
//           zwarn("Join cancelled right after join() resolved — tearing down via leaveMeeting().");
//           try {
//             client.leaveMeeting?.();
//           } catch (cleanupErr) {
//             zerror("cleanup leaveMeeting() after cancelled join()", cleanupErr);
//           }
//           setClient(null);
//           return;
//         }

//         hasJoinedRef.current = true;

//         try {
//           const me = client.getCurrentUser?.();
//           zlog("📋 getCurrentUser() right after join:", me);
//           if (me?.userId != null) currentUserIdRef.current = me.userId;
//         } catch (idErr) {
//           zerror("getCurrentUser() right after join", idErr);
//         }

//         await waitForConnected(client);
//         await sleep(400);
//         if (isCancelled()) return;

//         await applyViewType(client);
//         nudgeResize();

//         setJoining(false);
//         onJoined?.();
//         logUserState(client, "state once fully joined");

//         try {
//           const attendees = client.getAttendeeslist?.() ?? [];
//           zlog("📋 getAttendeeslist():", attendees);
//           setParticipants((prev) => {
//             const next = [...prev];
//             for (const a of attendees) {
//               if (!next.some((p) => p.userId === a.userId)) {
//                 next.push({
//                   userId: a.userId,
//                   displayName:
//                     a.userName || a.displayName || `User ${a.userId}`,
//                   audioStatus: "idle",
//                 });
//               }
//             }
//             return next;
//           });
//         } catch (rosterErr) {
//           zerror("getAttendeeslist()", rosterErr);
//         }

//         setTimeout(() => {
//           if (
//             !isCancelled() &&
//             myAudioStatusRef.current === "idle"
//           ) {
//             setShowJoinAudioHint(true);
//           }
//         }, 6000);

//         nudgeResize();
//       } catch (err: any) {
//         if (isCancelled()) return;
//         setJoining(false);

//         zerror("Join flow (outer catch)", err);

//         try {
//           client?.leaveMeeting?.();
//         } catch (cleanupErr) {
//           zerror("cleanup leaveMeeting() in outer catch", cleanupErr);
//         }
//         setClient(null);

//         const rawMessage: string = (
//           err?.reason ||
//           err?.message ||
//           ""
//         );
//         const msg = rawMessage.toLowerCase();

//         let friendlyMessage: string;
//         if (msg.includes("container_timeout")) {
//           friendlyMessage =
//             "Could not load the video area in time. Please check your connection and try again.";
//         } else if (
//           msg.includes("permission") ||
//           msg.includes("blocked")
//         ) {
//           friendlyMessage =
//             err.message ||
//             "Camera/microphone permission is blocked. Please allow access and refresh.";
//         } else if (msg.includes("signature")) {
//           friendlyMessage =
//             "Join link invalid/expired. Please refresh and try again.";
//         } else if (msg.includes("expire")) {
//           friendlyMessage = "This meeting session has expired.";
//         } else {
//           friendlyMessage =
//             "Could not connect to the live class. Check your internet connection.";
//         }

//         zlog("Mapped friendly error message shown to user:", friendlyMessage, "| from raw:", rawMessage);
//         setError(friendlyMessage);
//         onError?.(friendlyMessage);
//       }
//     })();

//     return () => {
//       cancelled = true;

//       if (hasJoinedRef.current) {
//         if (_persistentMode) {
//           zlog("Component cleanup skipped (persistent mode — established session continues).");
//         } else {
//           try {
//             internalClientRef.current?.leaveMeeting?.();
//             zlog("leaveMeeting() called on standalone-mode unmount.");
//           } catch (err) {
//             zerror("leaveMeeting() on standalone-mode unmount", err);
//           }
//           hasJoinedRef.current = false;
//           internalClientRef.current = null;
//           if (_clientRef) _clientRef.current = null;
//           currentUserIdRef.current = null;
//         }
//       } else {
//         try {
//           internalClientRef.current?.leaveMeeting?.();
//           zlog("leaveMeeting() called for abandoned (never-joined) attempt.");
//         } catch (err) {
//           zerror("leaveMeeting() for abandoned attempt", err);
//         }
//         internalClientRef.current = null;
//         if (_clientRef) _clientRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [joinInfo.providerMeetingId]);

//   // ── Error state ─────────────────────────────────────────────────────────────

//   if (error) {
//     return (
//       <div className="flex h-full min-h-[50dvh] flex-col items-center justify-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
//         <p className="text-sm font-medium text-destructive">{error}</p>
//         <button
//           onClick={onLeave}
//           className="rounded-lg bg-[#0037FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0037FF]/90"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // ── Responsive sizing ───────────────────────────────────────────────────────

//   const wrapperStyle: React.CSSProperties = _minimized
//     ? { width: "100%", height: "100%" }
//     : { width: "100%", height: "100%" };

//   const audioStatusLabel: Record<AudioStatus, string> = {
//     idle: "Audio not joined yet",
//     connected: "Audio connected",
//     muted: "Audio connected (muted)",
//     blocked: "Audio blocked",
//     unknown: "Audio status unknown",
//   };

//   // ── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <div
//       ref={wrapperRef}
//       style={wrapperStyle}
//       className={cn(
//         "relative h-full w-full overflow-hidden bg-black transition-[height] duration-200",
//         isFullscreen || hideOwnChrome
//           ? "rounded-none border-none"
//           : "rounded-xl border border-border"
//       )}
//     >
//       {/* Connecting overlay */}
//       {joining && (
//         <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 text-sm text-white">
//           Connecting{" "}
//           {role === "mentor" ? "as host" : "to class"}…
//         </div>
//       )}

//       {/* Who-am-I badge */}
//       {!hideOwnChrome && !joining && (
//         <div
//           className={cn(
//             "absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm sm:left-3 sm:top-3",
//             role === "mentor"
//               ? "bg-[#0037FF]/80"
//               : "bg-black/60"
//           )}
//         >
//           {role === "mentor"
//             ? "You: Mentor (Host)"
//             : `You: ${userName}`}
//         </div>
//       )}

//       {/* Audio status badge */}
//       {!hideOwnChrome && !joining && (
//         <button
//           type="button"
//           onClick={() =>
//             setShowParticipantAudio((v) => !v)
//           }
//           title="Toggle participant audio status"
//           className={cn(
//             "absolute left-2 top-9 z-20 flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm sm:left-3 sm:top-11",
//             myAudioStatus === "connected" &&
//               "bg-emerald-600/80",
//             myAudioStatus === "muted" && "bg-amber-600/80",
//             (myAudioStatus === "blocked" ||
//               myAudioStatus === "unknown") &&
//               "bg-red-600/80",
//             myAudioStatus === "idle" && "bg-black/60"
//           )}
//         >
//           {myAudioStatus === "connected" && (
//             <Volume2 size={12} />
//           )}
//           {myAudioStatus === "muted" && <MicOff size={12} />}
//           {(myAudioStatus === "idle" ||
//             myAudioStatus === "blocked" ||
//             myAudioStatus === "unknown") && (
//             <Mic size={12} />
//           )}
//           {audioStatusLabel[myAudioStatus]}
//           <Users size={12} className="ml-1 opacity-70" />
//         </button>
//       )}

//       {/* Participant audio panel */}
//       {!hideOwnChrome && !joining && showParticipantAudio && (
//         <div className="absolute left-2 top-16 z-20 max-h-48 w-56 overflow-y-auto rounded-lg bg-black/80 p-2 text-[11px] text-white backdrop-blur-sm sm:left-3 sm:top-[4.5rem]">
//           <p className="mb-1 font-semibold opacity-80">
//             Participant audio
//           </p>
//           {participants.length === 0 && (
//             <p className="opacity-60">No data yet…</p>
//           )}
//           {participants.map((p) => (
//             <div
//               key={p.userId}
//               className="flex items-center justify-between gap-2 py-0.5"
//             >
//               <span className="truncate">{p.displayName}</span>
//               <span
//                 className={cn(
//                   "flex items-center gap-1 rounded px-1.5 py-0.5",
//                   p.audioStatus === "connected" &&
//                     "bg-emerald-600/70",
//                   p.audioStatus === "muted" &&
//                     "bg-amber-600/70",
//                   p.audioStatus === "idle" && "bg-white/10",
//                   p.audioStatus === "unknown" && "bg-red-600/70"
//                 )}
//               >
//                 {p.audioStatus === "muted" ? (
//                   <MicOff size={10} />
//                 ) : (
//                   <Mic size={10} />
//                 )}
//                 {p.audioStatus}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Join audio hint */}
//       {!hideOwnChrome &&
//         !joining &&
//         !_minimized &&
//         showJoinAudioHint &&
//         myAudioStatus !== "connected" &&
//         myAudioStatus !== "muted" && (
//           <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-end justify-end p-3 sm:p-4">
//             <div className="pointer-events-auto mb-2 flex max-w-[260px] items-start gap-2 rounded-lg bg-[#0037FF] px-3 py-2 text-xs text-white shadow-lg sm:max-w-xs sm:text-sm">
//               <Mic size={16} className="mt-0.5 shrink-0" />
//               <span>
//                 Click the microphone icon in the toolbar below
//                 to join audio, then you'll hear everyone in the
//                 class.
//               </span>
//               <button
//                 type="button"
//                 onClick={dismissJoinAudioHint}
//                 className="ml-1 shrink-0 rounded px-1 text-white/80 hover:text-white"
//                 title="Dismiss"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//         )}

//       {/* Custom controls (fullscreen / expand) */}
//       {!hideOwnChrome && !joining && !_minimized && (
//         <div className="absolute bottom-16 right-2 z-20 flex flex-col items-end gap-1.5 sm:bottom-20 sm:right-3 sm:gap-2">
//           {!isFullscreen && (
//             <button
//               type="button"
//               onClick={toggleViewMode}
//               title={
//                 viewMode === "compact"
//                   ? "Expand view"
//                   : "Compact view"
//               }
//               className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 sm:h-9 sm:w-9"
//             >
//               {viewMode === "compact" ? (
//                 <Expand size={16} />
//               ) : (
//                 <Shrink size={16} />
//               )}
//             </button>
//           )}
//           <button
//             type="button"
//             onClick={toggleFullscreen}
//             title={
//               isFullscreen ? "Exit full screen" : "Full screen"
//             }
//             className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 sm:h-9 sm:w-9"
//           >
//             {isFullscreen ? (
//               <Minimize2 size={16} />
//             ) : (
//               <Maximize2 size={16} />
//             )}
//           </button>
//         </div>
//       )}

//       {/* Zoom SDK root */}
//       <div
//         ref={containerRef}
//         className="h-full w-full"
//         style={
//           _minimized
//             ? {
//                 minWidth: 160,
//                 minHeight: 120,
//                 maxWidth: "100%",
//                 maxHeight: "100%",
//                 boxSizing: "border-box",
//                 position: "relative",
//                 overflow: "hidden",
//               }
//             : {
//                 minWidth: 0,
//                 minHeight: 0,
//                 maxWidth: "100%",
//                 maxHeight: "100%",
//                 boxSizing: "border-box",
//                 position: "relative",
//                 overflow: "hidden",
//               }
//         }
//       />
//     </div>
//   );
// };













/**
 * src/features/live-class/components/ZoomMeetingRoom.tsx
 * 
 * OFFICIAL ZOOM SDK COMPONENT VIEW
 * - No custom UI (SDK khud Mic/Video/Chat/Share render karega)
 * - createPortal se screen ke top par render hota hai
 * - StrictMode guard (double-mount se bachne ke liye)
 */
import { useEffect, useRef, useState } from "react";
import type { SuspensionViewType } from "@zoom/meetingsdk/embedded";
import type { JoinLiveClassPayload } from "@/integrations/client";

interface ZoomMeetingRoomProps {
  joinInfo: JoinLiveClassPayload;
  userName: string;
  role: "mentor" | "student";
  onLeave: () => void;
  onJoined?: () => void;
  onError?: (message: string) => void;
  _clientRef?: React.MutableRefObject<any>;
}

export const ZoomMeetingRoom = ({
  joinInfo,
  userName,
  role,
  onLeave,
  onJoined,
  onError,
  _clientRef,
}: ZoomMeetingRoomProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [joining, setJoining] = useState(true);
  const clientRef = useRef<any>(null);
  const hasJoinedRef = useRef(false); // StrictMode double-run guard

  useEffect(() => {
    let cancelled = false;

    const joinMeeting = async () => {
      try {
        // 1. Container ka size ready hone ka wait karo (SDK ko real dimensions chahiye)
        await new Promise<void>((resolve) => {
          const check = () => {
            if (cancelled) return;
            if (
              containerRef.current &&
              containerRef.current.clientWidth > 0 &&
              containerRef.current.clientHeight > 0
            ) {
              resolve();
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });

        if (cancelled) return;

        // 2. SDK Dynamic Import karo
        const { default: ZoomMtgEmbedded } = await import("@zoom/meetingsdk/embedded");
        const client = ZoomMtgEmbedded.createClient();
        clientRef.current = client;
        if (_clientRef) _clientRef.current = client;

        // 3. Initialize (Simple & Official - viewSizes hata diya)
        await client.init({
          zoomAppRoot: containerRef.current,
          language: "en-US",
          patchJsMedia: true,
          leaveOnPageUnload: true,
          maximumVideosInGalleryView: 1,
          customize: {
            video: {
              isResizable: true,
              // The SDK exposes a nominal string enum, so the valid runtime
              // value must be cast to its declared enum type.
              defaultViewType: "speaker" as SuspensionViewType,
              popper: { disableDraggable: true },
            },
          },
        });

        if (cancelled) return;

        // 4. Join Meeting
        console.log("🟢 Joining Zoom meeting...");
        await client.join({
          signature: joinInfo.signature,
          meetingNumber: joinInfo.providerMeetingId,
          password: joinInfo.password || "",
          userName: userName,
          // Host/Mentor ke liye ZAK token
          ...(role === "mentor" && joinInfo.zak ? { zak: joinInfo.zak } : {}),
        });
        console.log("✅ Zoom meeting joined!");

        if (cancelled) return;

        // Force the embedded canvas into the classroom's single-speaker stage
        // immediately after join. This does not depend on another attendee.
        await Promise.resolve(client.setViewType?.("speaker"));

        // Register the connection listener before publishing the joined state
        // so controls and cleanup are ready together, even in an empty class.
        client.on("connection-change", (payload: { state: string }) => {
          if (payload.state === "Closed" || payload.state === "Fail") {
            onLeave();
          }
        });

        hasJoinedRef.current = true;
        setJoining(false);
        onJoined?.();

      } catch (err: any) {
        if (cancelled) return;
        setJoining(false);
        console.error("Zoom Join Error:", err);
        
        const msg = err?.reason || err?.message || "Connection failed";
        if (onError) onError(msg);
        else {
          alert(msg);
          onLeave();
        }
      }
    };

    // StrictMode guard: agar already joined hai, toh dobar run mat karo
    if (!hasJoinedRef.current) {
      joinMeeting();
    }

    return () => {
      cancelled = true;
      const activeClient = clientRef.current;
      try { activeClient?.leaveMeeting?.(); } catch (_) {}
      clientRef.current = null;
      if (_clientRef?.current === activeClient) _clientRef.current = null;
      hasJoinedRef.current = false;
    };
  }, [joinInfo, userName, role, onLeave, onJoined, onError]);

  // ── OFFICIAL ZOOM UI RENDER (Portal to Body) ──
  // The SDK root must exist even while joining. Previously the loading overlay
  // replaced this element, leaving containerRef null and the size-wait loop
  // above running forever.
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0 h-full w-full overflow-hidden" />
      {joining && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black text-sm text-white/75">
          Connecting {role === "mentor" ? "as host" : "to class"}...
        </div>
      )}
    </div>
  );
};
