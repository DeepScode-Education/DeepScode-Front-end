// import { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ConnectionError,
//   ConnectionState,
//   DisconnectReason,
//   ParticipantEvent,
//   RoomEvent,
//   Track,
//   type LocalParticipant,
//   type Participant,
// } from "livekit-client";
// import { useLiveClass } from "@/contexts/LiveClassContext";
// import { useLiveClassSocket } from "@/features/live-class/hooks/useLiveClassSocket";
// import { cn } from "@/lib/utils";
// import type { ActiveSession } from "@/contexts/LiveClassContext";

// interface LiveClassShellProps {
//   role: "mentor" | "student";
//   title: string;
//   onLeaveOrEnd: () => void | Promise<void>;
//   minimizedToDashboard: boolean;
//   onMinimizeToDashboard: () => void;
//   onRestoreFromDashboard: () => void;
//   session: ActiveSession;
//   onError: (message: string) => void;
// }

// const getParticipantName = (participant: Participant) =>
//   participant.name || participant.identity || "Guest";

// // Participant-level events that change what a track looks like / whether it exists.
// const PARTICIPANT_TRACK_EVENTS = [
//   ParticipantEvent.TrackPublished,
//   ParticipantEvent.TrackUnpublished,
//   ParticipantEvent.TrackSubscribed,
//   ParticipantEvent.TrackUnsubscribed,
//   ParticipantEvent.TrackMuted,
//   ParticipantEvent.TrackUnmuted,
//   ParticipantEvent.LocalTrackPublished,
//   ParticipantEvent.LocalTrackUnpublished,
// ] as const;

// // Room-level events that should refresh the participant list / control state.
// const ROOM_SYNC_EVENTS = [
//   RoomEvent.Connected,
//   RoomEvent.Reconnected,
//   RoomEvent.ConnectionStateChanged,
//   RoomEvent.ParticipantConnected,
//   RoomEvent.ParticipantDisconnected,
//   RoomEvent.ParticipantNameChanged,
//   RoomEvent.TrackPublished,
//   RoomEvent.TrackUnpublished,
//   RoomEvent.TrackSubscribed,
//   RoomEvent.TrackUnsubscribed,
//   RoomEvent.TrackMuted,
//   RoomEvent.TrackUnmuted,
//   RoomEvent.LocalTrackPublished,
//   RoomEvent.LocalTrackUnpublished,
//   RoomEvent.ActiveSpeakersChanged,
//   RoomEvent.AudioPlaybackStatusChanged,
// ] as const;

// /**
//  * Returns the participant's CURRENT publication for a source and re-renders
//  * whenever it is published / subscribed / muted / removed. This is what makes
//  * a track that arrives AFTER first render (the normal case for remote
//  * camera / screen share) actually show up.
//  */
// const usePublication = (participant: Participant | null, source: Track.Source) => {
//   const [, forceRender] = useState(0);

//   useEffect(() => {
//     if (!participant) return;
//     const bump = () => forceRender((n) => n + 1);
//     PARTICIPANT_TRACK_EVENTS.forEach((event) => participant.on(event as ParticipantEvent.TrackMuted, bump));
//     bump(); // catch anything that changed between render and effect
//     return () => {
//       PARTICIPANT_TRACK_EVENTS.forEach((event) => participant.off(event as ParticipantEvent.TrackMuted, bump));
//     };
//   }, [participant]);

//   return participant?.getTrackPublication(source);
// };

// const hasLiveCamera = (participant: Participant) => {
//   const pub = participant.getTrackPublication(Track.Source.Camera);
//   return !!pub?.track && !pub.isMuted;
// };

// const ParticipantVideo = ({
//   participant,
//   source,
//   fit = "cover",
//   mirror = false,
// }: {
//   participant: Participant;
//   source: Track.Source;
//   fit?: "cover" | "contain";
//   mirror?: boolean;
// }) => {
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const publication = usePublication(participant, source);
//   const track = publication?.track;
//   const showVideo = !!track && !publication?.isMuted;

//   useEffect(() => {
//     const element = videoRef.current;
//     if (!element || !track) return;
//     track.attach(element);
//     return () => {
//       track.detach(element); // detach only THIS element, never other views of the same track
//     };
//   }, [track]);

//   return (
//     <div className="relative h-full w-full bg-slate-950">
//       <video
//         ref={videoRef}
//         className={cn(
//           "h-full w-full",
//           fit === "contain" ? "object-contain" : "object-cover",
//           mirror && "scale-x-[-1]",
//           !showVideo && "invisible",
//         )}
//         autoPlay
//         playsInline
//         muted
//       />
//       {!showVideo && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/70">
//           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold uppercase">
//             {getParticipantName(participant).charAt(0)}
//           </div>
//           <div className="text-xs">{source === Track.Source.ScreenShare ? "Waiting for screen…" : "Camera off"}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Remote audio is NOT part of any <video>; it needs its own <audio> sink per track.
// const AudioSink = ({ participant, source }: { participant: Participant; source: Track.Source }) => {
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const publication = usePublication(participant, source);
//   const track = publication?.track;

//   useEffect(() => {
//     const element = audioRef.current;
//     if (!element || !track) return;
//     track.attach(element);
//     return () => {
//       track.detach(element);
//     };
//   }, [track]);

//   return <audio ref={audioRef} autoPlay />;
// };

// const RemoteAudio = ({ participants }: { participants: Participant[] }) => (
//   <div className="hidden" aria-hidden>
//     {participants
//       .filter((participant) => !participant.isLocal)
//       .map((participant) => (
//         <div key={participant.identity}>
//           <AudioSink participant={participant} source={Track.Source.Microphone} />
//           <AudioSink participant={participant} source={Track.Source.ScreenShareAudio} />
//         </div>
//       ))}
//   </div>
// );

// const connectionLabelFor = (state: ConnectionState) => {
//   switch (state) {
//     case ConnectionState.Connected:
//       return "Connected";
//     case ConnectionState.Connecting:
//       return "Connecting…";
//     case ConnectionState.Reconnecting:
//     case ConnectionState.SignalReconnecting:
//       return "Reconnecting…";
//     default:
//       return "Disconnected";
//   }
// };

// const StageCard = ({ title, className }: { participant: Participant | null; title: string; className?: string }) => (
//   <div className={cn("flex h-full w-full items-center justify-center bg-slate-950 text-white/75", className)}>
//     <div className="text-center">
//       <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">Classroom</div>
//       <div className="text-xl font-semibold">{title}</div>
//     </div>
//   </div>
// );

// export const LiveClassShell = ({
//   role,
//   title,
//   onLeaveOrEnd,
//   minimizedToDashboard,
//   onMinimizeToDashboard,
//   onRestoreFromDashboard,
//   session,
//   onError,
// }: LiveClassShellProps) => {
//   const { roomRef, connectionState, isJoining } = useLiveClass();
//   const [chatOpen, setChatOpen] = useState(false);
//   const [participantsOpen, setParticipantsOpen] = useState(false);
//   const [chatInput, setChatInput] = useState("");
//   const [isMuted, setIsMuted] = useState(true);
//   const [isVideoEnabled, setIsVideoEnabled] = useState(false);
//   const [isScreenSharing, setIsScreenSharing] = useState(false);
//   const [isHandRaised, setIsHandRaised] = useState(false);
//   const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; message: string; isMine?: boolean }>>([]);
//   const [liveParticipants, setLiveParticipants] = useState<Participant[]>([]);
//   const [screenSharingParticipant, setScreenSharingParticipant] = useState<Participant | null>(null);
//   const [canPlayAudio, setCanPlayAudio] = useState(true);
//   const [actionError, setActionError] = useState<string | null>(null);
//   const [leaving, setLeaving] = useState(false);

//   const { emitRaiseHand, emitChatMessage } = useLiveClassSocket(session.liveClassId, {
//     onHandRaised: ({ userName, raised }) => {
//       if (userName === session.userName) {
//         setIsHandRaised(raised);
//       }
//     },
//     onChatMessage: ({ userName, message }) => {
//       setChatMessages((prev) => [
//         ...prev,
//         {
//           id: `${userName}-${Date.now()}-${Math.random()}`,
//           sender: userName,
//           message,
//           isMine: userName === session.userName,
//         },
//       ]);
//     },
//   });

//   // Single source of truth for participants + control state, read straight from the Room.
//   const syncRoomState = useCallback(() => {
//     const room = roomRef.current;
//     if (!room) return;
//     const local = room.localParticipant;
//     const remotes = Array.from(room.remoteParticipants.values());

//     setLiveParticipants([local, ...remotes]);
//     setIsMuted(!local.isMicrophoneEnabled);
//     setIsVideoEnabled(local.isCameraEnabled);
//     setIsScreenSharing(local.isScreenShareEnabled);
//     setCanPlayAudio(room.canPlaybackAudio);

//     const sharer = remotes.find((participant) => !!participant.getTrackPublication(Track.Source.ScreenShare)?.track);
//     setScreenSharingParticipant(sharer ?? null);
//   }, [roomRef]);

//   useEffect(() => {
//     const room = roomRef.current;
//     if (!room) return;

//     syncRoomState();
//     ROOM_SYNC_EVENTS.forEach((event) => room.on(event as RoomEvent.Connected, syncRoomState));
//     return () => {
//       // Listeners only — the Room itself is owned by LiveClassContext.
//       ROOM_SYNC_EVENTS.forEach((event) => room.off(event as RoomEvent.Connected, syncRoomState));
//     };
//   }, [roomRef, syncRoomState]);

//   // Connect once per session. Connected / Reconnecting / Reconnected / Disconnected
//   // are handled by LiveClassContext; a temporary reconnect never clears the session.
//   useEffect(() => {
//     const room = roomRef.current;
//     if (!room || room.state !== ConnectionState.Disconnected) return;

//     const connectToLiveKit = async () => {
//       try {
//         const joinData = session.joinInfo;
//         const token = joinData?.token;
//         const livekitUrl = joinData?.livekitUrl || import.meta.env.VITE_LIVEKIT_URL;
//         const roomName = joinData?.roomName;

//         if (!token || typeof token !== "string") {
//           throw new Error("Invalid LiveKit token received from backend");
//         }
//         if (!livekitUrl) {
//           throw new Error("LiveKit URL is missing");
//         }
//         if (!roomName) {
//           throw new Error("LiveKit room name is missing");
//         }

//         await room.connect(livekitUrl, token);
//       } catch (error) {
//         // The user already left / class ended while connecting — not a join failure.
//         if (roomRef.current !== room) return;
//         console.error("Failed to connect LiveKit room:", error);
//         let detail = error instanceof Error ? error.message : "LiveKit connection failed";
//         if (error instanceof ConnectionError) {
//           const serverReason =
//             typeof error.context === "number" ? ` / server: ${DisconnectReason[error.context]}` : "";
//           detail = `${detail} [${error.reasonName}${serverReason}]`;
//         }
//         onError(detail);
//       }
//     };

//     void connectToLiveKit();
//   }, [onError, roomRef, session]);

//   const participantCount = liveParticipants.length;
//   const connected = connectionState === ConnectionState.Connected;
//   const reconnecting =
//     connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.SignalReconnecting;

//   // Main stage: any screen share wins. Otherwise the mentor's camera
//   // (mentor sees self; student waits until the mentor is in the room).
//   const localParticipant = liveParticipants.find((participant) => participant.isLocal) ?? null;
//   const hostParticipant = liveParticipants.find((participant) => participant.identity.startsWith("mentor_")) ?? null;
//   const stageParticipant = screenSharingParticipant ?? (role === "mentor" ? localParticipant : hostParticipant);
//   const stageSource = screenSharingParticipant ? Track.Source.ScreenShare : Track.Source.Camera;
//   const cameraTiles = liveParticipants.filter(
//     (participant) =>
//       hasLiveCamera(participant) && !(stageSource === Track.Source.Camera && participant === stageParticipant),
//   );

//   const runMediaToggle = async (action: (local: LocalParticipant) => Promise<unknown>) => {
//     const room = roomRef.current;
//     if (!room) return;
//     setActionError(null);
//     try {
//       await action(room.localParticipant);
//     } catch (error) {
//       console.error("LiveKit media toggle failed:", error);
//       setActionError(error instanceof Error ? error.message : "Could not change your media settings.");
//     } finally {
//       syncRoomState(); // reflect the real published-track state
//     }
//   };

//   const handleToggleMic = () =>
//     runMediaToggle((local) => local.setMicrophoneEnabled(!local.isMicrophoneEnabled));

//   const handleToggleCamera = () =>
//     runMediaToggle((local) => local.setCameraEnabled(!local.isCameraEnabled));

//   const handleToggleScreenShare = () =>
//     runMediaToggle((local) => local.setScreenShareEnabled(!local.isScreenShareEnabled));

//   const handleEnableAudio = async () => {
//     try {
//       await roomRef.current?.startAudio();
//     } finally {
//       syncRoomState();
//     }
//   };

//   const handleRaiseHand = () => {
//     const next = !isHandRaised;
//     setIsHandRaised(next);
//     emitRaiseHand({ liveClassId: session.liveClassId, userName: session.userName, raised: next });
//   };

//   const handleSendChat = () => {
//     if (!chatInput.trim()) return;
//     const payload = {
//       liveClassId: session.liveClassId,
//       userName: session.userName,
//       message: chatInput.trim(),
//     };
//     emitChatMessage(payload);
//     setChatMessages((prev) => [
//       ...prev,
//       { id: `local-${Date.now()}`, sender: session.userName, message: payload.message, isMine: true },
//     ]);
//     setChatInput("");
//   };

//   const handleLeaveOrEnd = async () => {
//     if (leaving) return;
//     setLeaving(true);
//     setActionError(null);
//     try {
//       await onLeaveOrEnd();
//     } catch (error) {
//       // Stay in the class and show why — never drop the user out on a failed End/Leave call.
//       setActionError(error instanceof Error ? error.message : "Could not end the class.");
//       setLeaving(false);
//     }
//   };

//   const connectionLabel = connectionLabelFor(connectionState);

//   return (
//     <div className={cn("fixed inset-0 z-[60] bg-slate-950 text-white", minimizedToDashboard && "hidden")}>
//       <RemoteAudio participants={liveParticipants} />
//       {actionError && (
//         <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-red-600 px-4 py-2 text-sm text-white">
//           <span>{actionError}</span>
//           <button type="button" onClick={() => setActionError(null)} className="font-semibold">✕</button>
//         </div>
//       )}
//       <div className="flex h-full flex-col">
//         <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/90 px-3 py-3 sm:px-5">
//           <div className="flex min-w-0 items-center gap-3">
//             <button
//               type="button"
//               onClick={onMinimizeToDashboard}
//               aria-label="Minimize classroom"
//               className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
//             >
//               <span className="text-lg leading-none">−</span>
//             </button>
//             <div className="min-w-0">
//               <div className="truncate text-base font-semibold sm:text-lg">{title}</div>
//               <div className="flex items-center gap-2 text-xs text-white/70">
//                 <span className="inline-flex items-center gap-1 rounded-full bg-red-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-300">
//                   <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
//                   Live
//                 </span>
//                 <span>{connectionLabel}</span>
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button type="button" onClick={() => setChatOpen((v) => !v)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm">Chat</button>
//             <button type="button" onClick={() => setParticipantsOpen((v) => !v)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm">Participants ({participantCount})</button>
//             <button type="button" onClick={handleLeaveOrEnd} disabled={leaving} className="rounded-full bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500 sm:text-sm">{role === "mentor" ? "End Class" : "Leave"}</button>
//           </div>
//         </header>

//         <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 sm:p-4 lg:flex-row">
//           <div className="relative min-h-[32vh] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
//             {stageParticipant ? (
//               <div className="h-full w-full">
//                 <ParticipantVideo
//                   key={`${stageParticipant.identity}-${stageSource}`}
//                   participant={stageParticipant}
//                   source={stageSource}
//                   fit={stageSource === Track.Source.ScreenShare ? "contain" : "cover"}
//                   mirror={stageParticipant.isLocal && stageSource === Track.Source.Camera}
//                 />
//               </div>
//             ) : (
//               <StageCard participant={null} title={role === "mentor" ? "Your classroom" : "Waiting for the mentor to join…"} />
//             )}

//             {stageParticipant && (
//               <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
//                 {screenSharingParticipant ? `${getParticipantName(screenSharingParticipant)} is sharing` : getParticipantName(stageParticipant)}
//               </div>
//             )}

//             {isScreenSharing && !screenSharingParticipant && (
//               <div className="absolute left-3 top-3 rounded-full bg-emerald-600/80 px-3 py-1 text-xs font-semibold text-white">
//                 You are sharing your screen
//               </div>
//             )}

//             {reconnecting && (
//               <div className="absolute inset-x-0 top-0 bg-amber-500/90 px-3 py-1.5 text-center text-xs font-semibold text-black">
//                 Connection unstable — reconnecting. Your class is still active.
//               </div>
//             )}

//             {connected && !canPlayAudio && (
//               <button
//                 type="button"
//                 onClick={handleEnableAudio}
//                 className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg"
//               >
//                 🔊 Tap to enable class audio
//               </button>
//             )}

//             {cameraTiles.length > 0 && (
//               <div className="absolute bottom-3 right-3 flex max-w-[70%] gap-2 overflow-x-auto">
//                 {cameraTiles.map((participant) => (
//                   <div
//                     key={participant.identity}
//                     className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/20 bg-slate-900 sm:h-24 sm:w-40"
//                   >
//                     <ParticipantVideo
//                       participant={participant}
//                       source={Track.Source.Camera}
//                       mirror={participant.isLocal}
//                     />
//                     <div className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
//                       {participant.isLocal ? "You" : getParticipantName(participant)}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           <aside className={cn("w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 transition-all lg:w-[320px]", participantsOpen ? "block" : "hidden lg:block")}>
//             <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
//               <h3 className="text-sm font-semibold text-white">Participants</h3>
//               <button type="button" className="text-white/60 hover:text-white lg:hidden" onClick={() => setParticipantsOpen(false)}>
//                 ✕
//               </button>
//             </div>
//             <div className="max-h-[52vh] space-y-2 overflow-y-auto p-3">
//               {liveParticipants.map((participant) => (
//                 <div key={participant.identity} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
//                   <div className="min-w-0">
//                     <div className="truncate text-sm font-medium text-white">{getParticipantName(participant)}</div>
//                     <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-white/60">
//                       <span>{participant.isLocal ? "You" : participant.identity}</span>
//                       {participant.isSpeaking && <span className="text-sky-300">Speaking</span>}
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-white/80">
//                     {participant.isMicrophoneEnabled ? "🎙️" : "🔇"}
//                     {participant.isCameraEnabled ? "📹" : "🚫"}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </aside>
//         </div>

//         <div className="border-t border-white/10 bg-slate-950/90 px-3 py-3">
//           <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
//             <button type="button" onClick={handleToggleMic} disabled={isJoining || !connected} className={cn("flex h-12 w-12 items-center justify-center rounded-full border text-white transition sm:h-14 sm:w-14", isMuted ? "border-white/10 bg-white/5" : "border-emerald-400/50 bg-emerald-500/20")}>
//               {isMuted ? "🔇" : "🎙️"}
//             </button>
//             <button type="button" onClick={handleToggleCamera} disabled={isJoining || !connected} className={cn("flex h-12 w-12 items-center justify-center rounded-full border text-white transition sm:h-14 sm:w-14", !isVideoEnabled ? "border-white/10 bg-white/5" : "border-sky-400/50 bg-sky-500/20")}>
//               {isVideoEnabled ? "📹" : "🚫"}
//             </button>
//             <button type="button" onClick={handleRaiseHand} className={cn("flex h-12 w-12 items-center justify-center rounded-full border sm:h-14 sm:w-14", isHandRaised ? "border-amber-300 bg-amber-500/20 text-amber-200" : "border-white/10 bg-white/5 text-white")}>
//               ✋
//             </button>
//             <button type="button" onClick={handleToggleScreenShare} disabled={isJoining || !connected} className={cn("flex h-12 w-12 items-center justify-center rounded-full border text-white transition sm:h-14 sm:w-14", isScreenSharing ? "border-emerald-400/50 bg-emerald-500/20" : "border-white/10 bg-white/5")}>
//               🖥️
//             </button>
//             <button type="button" onClick={() => setChatOpen((v) => !v)} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white sm:h-14 sm:w-14">💬</button>
//             <button type="button" onClick={handleLeaveOrEnd} disabled={leaving} className="flex h-12 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-500 sm:h-14">{role === "mentor" ? "End Class" : "Leave"}</button>
//           </div>
//         </div>
//       </div>

//       {chatOpen && (
//         <div className="absolute bottom-24 right-4 z-20 h-[320px] w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-sm">
//           <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
//             <div className="font-semibold text-white">Class chat</div>
//             <button type="button" onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white">✕</button>
//           </div>
//           <div className="flex h-[220px] flex-col gap-2 overflow-y-auto p-3">
//             {chatMessages.length === 0 ? (
//               <div className="flex h-full items-center justify-center text-sm text-white/50">No messages yet</div>
//             ) : (
//               chatMessages.map((message) => (
//                 <div key={message.id} className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm", message.isMine ? "ml-auto bg-blue-600 text-white" : "bg-white/5 text-white")}>
//                   <div className="text-[10px] uppercase tracking-wide text-white/70">{message.sender}</div>
//                   <div>{message.message}</div>
//                 </div>
//               ))
//             )}
//           </div>
//           <div className="flex items-center gap-2 border-t border-white/10 p-3">
//             <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type a message" className="h-10 flex-1 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-white/40" onKeyDown={(event) => { if (event.key === "Enter") handleSendChat(); }} />
//             <button type="button" onClick={handleSendChat} className="h-10 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white">Send</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };










import { useCallback, useEffect, useRef, useState } from "react";
import {
  ConnectionError,
  ConnectionState,
  DisconnectReason,
  ParticipantEvent,
  RoomEvent,
  Track,
  type LocalParticipant,
  type Participant,
} from "livekit-client";
import {
  Maximize2,
  Minimize2,
  MessageSquare,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  ScreenShare,
  ScreenShareOff,
  Users,
  Wifi,
  WifiOff,
  PhoneOff,
  LogOut,
  X,
  Send,
} from "lucide-react";
import { useLiveClass } from "@/contexts/LiveClassContext";
import { useLiveClassSocket } from "@/features/live-class/hooks/useLiveClassSocket";
import { cn } from "@/lib/utils";
import type { ActiveSession } from "@/contexts/LiveClassContext";

interface LiveClassShellProps {
  role: "mentor" | "student";
  title: string;
  onLeaveOrEnd: () => void | Promise<void>;
  minimizedToDashboard: boolean;
  onMinimizeToDashboard: () => void;
  onRestoreFromDashboard: () => void;
  session: ActiveSession;
  onError: (message: string) => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  senderId?: string;
  isMine?: boolean;
  timestamp?: number;
}

const getParticipantName = (participant: Participant) =>
  participant.name?.trim() || participant.identity?.trim() || "Participant";

const PARTICIPANT_TRACK_EVENTS = [
  ParticipantEvent.TrackPublished,
  ParticipantEvent.TrackUnpublished,
  ParticipantEvent.TrackSubscribed,
  ParticipantEvent.TrackUnsubscribed,
  ParticipantEvent.TrackMuted,
  ParticipantEvent.TrackUnmuted,
  ParticipantEvent.LocalTrackPublished,
  ParticipantEvent.LocalTrackUnpublished,
] as const;

const ROOM_SYNC_EVENTS = [
  RoomEvent.Connected,
  RoomEvent.Reconnected,
  RoomEvent.ConnectionStateChanged,
  RoomEvent.ParticipantConnected,
  RoomEvent.ParticipantDisconnected,
  RoomEvent.ParticipantNameChanged,
  RoomEvent.TrackPublished,
  RoomEvent.TrackUnpublished,
  RoomEvent.TrackSubscribed,
  RoomEvent.TrackUnsubscribed,
  RoomEvent.TrackMuted,
  RoomEvent.TrackUnmuted,
  RoomEvent.LocalTrackPublished,
  RoomEvent.LocalTrackUnpublished,
  RoomEvent.ActiveSpeakersChanged,
  RoomEvent.AudioPlaybackStatusChanged,
] as const;

const usePublication = (participant: Participant | null, source: Track.Source) => {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!participant) return;
    const bump = () => forceRender((n) => n + 1);
    PARTICIPANT_TRACK_EVENTS.forEach((event) =>
      participant.on(event as ParticipantEvent.TrackMuted, bump),
    );
    bump();
    return () => {
      PARTICIPANT_TRACK_EVENTS.forEach((event) =>
        participant.off(event as ParticipantEvent.TrackMuted, bump),
      );
    };
  }, [participant]);

  return participant?.getTrackPublication(source);
};

const hasLiveCamera = (participant: Participant) => {
  const pub = participant.getTrackPublication(Track.Source.Camera);
  return !!pub?.track && !pub.isMuted;
};

const ParticipantVideo = ({
  participant,
  source,
  fit = "cover",
  mirror = false,
}: {
  participant: Participant;
  source: Track.Source;
  fit?: "cover" | "contain";
  mirror?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const publication = usePublication(participant, source);
  const track = publication?.track;
  const showVideo = !!track && !publication?.isMuted;

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !track) return;
    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return (
    <div className="relative h-full w-full bg-black">
      <video
        ref={videoRef}
        className={cn(
          "h-full w-full",
          fit === "contain" ? "object-contain" : "object-cover",
          mirror && "scale-x-[-1]",
          !showVideo && "invisible",
        )}
        autoPlay
        playsInline
        muted
      />
      {!showVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 text-white/70">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold">
            {getParticipantName(participant).charAt(0).toUpperCase()}
          </div>
          <span className="text-xs">{source === Track.Source.ScreenShare ? "Waiting for screen…" : "Camera off"}</span>
        </div>
      )}
    </div>
  );
};

const AudioSink = ({ participant, source }: { participant: Participant; source: Track.Source }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const publication = usePublication(participant, source);
  const track = publication?.track;

  useEffect(() => {
    const element = audioRef.current;
    if (!element || !track) return;
    track.attach(element);
    return () => {
      track.detach(element);
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
};

const RemoteAudio = ({ participants }: { participants: Participant[] }) => (
  <div className="hidden" aria-hidden>
    {participants
      .filter((participant) => !participant.isLocal)
      .map((participant) => (
        <div key={participant.identity}>
          <AudioSink participant={participant} source={Track.Source.Microphone} />
          <AudioSink participant={participant} source={Track.Source.ScreenShareAudio} />
        </div>
      ))}
  </div>
);

const connectionLabelFor = (state: ConnectionState) => {
  switch (state) {
    case ConnectionState.Connected:
      return "Connected";
    case ConnectionState.Connecting:
      return "Connecting…";
    case ConnectionState.Reconnecting:
    case ConnectionState.SignalReconnecting:
      return "Reconnecting…";
    default:
      return "Disconnected";
  }
};

export const LiveClassShell = ({
  role,
  title,
  onLeaveOrEnd,
  minimizedToDashboard,
  onMinimizeToDashboard,
  session,
  onError,
}: LiveClassShellProps) => {
  const { roomRef, connectionState, isJoining } = useLiveClass();
  const classroomRef = useRef<HTMLDivElement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [liveParticipants, setLiveParticipants] = useState<Participant[]>([]);
  const [screenSharingParticipant, setScreenSharingParticipant] = useState<Participant | null>(null);
  const [canPlayAudio, setCanPlayAudio] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { emitRaiseHand, emitChatMessage } = useLiveClassSocket(session.liveClassId, {
    onHandRaised: ({ userName, raised }) => {
      if (userName === session.userName) setIsHandRaised(raised);
    },
    onChatMessage: ({ userName, message, senderId }) => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${senderId || userName}-${Date.now()}-${Math.random()}`,
          sender: userName,
          message,
          senderId,
          isMine: userName === session.userName,
          timestamp: Date.now(),
        },
      ]);
    },
  });

  const syncRoomState = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;

    const local = room.localParticipant;
    const remotes = Array.from(room.remoteParticipants.values());
    const participants = [local, ...remotes];

    setLiveParticipants(participants);
    setIsMuted(!local.isMicrophoneEnabled);
    setIsVideoEnabled(local.isCameraEnabled);
    setIsScreenSharing(local.isScreenShareEnabled);
    setCanPlayAudio(room.canPlaybackAudio);

    const sharer = participants.find(
      (participant) =>
        !!participant.getTrackPublication(Track.Source.ScreenShare)?.track &&
        !participant.getTrackPublication(Track.Source.ScreenShare)?.isMuted,
    );
    setScreenSharingParticipant(sharer ?? null);
  }, [roomRef]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room) return;

    syncRoomState();
    ROOM_SYNC_EVENTS.forEach((event) => room.on(event as RoomEvent.Connected, syncRoomState));
    return () => {
      ROOM_SYNC_EVENTS.forEach((event) => room.off(event as RoomEvent.Connected, syncRoomState));
    };
  }, [roomRef, syncRoomState]);

  useEffect(() => {
    const room = roomRef.current;
    if (!room || room.state !== ConnectionState.Disconnected) return;

    const connectToLiveKit = async () => {
      try {
        const joinData = session.joinInfo;
        const token = joinData?.token;
        const livekitUrl = joinData?.livekitUrl || import.meta.env.VITE_LIVEKIT_URL;
        const roomName = joinData?.roomName;

        if (!token || typeof token !== "string") throw new Error("Invalid LiveKit token received from backend");
        if (!livekitUrl) throw new Error("LiveKit URL is missing");
        if (!roomName) throw new Error("LiveKit room name is missing");

        await room.connect(livekitUrl, token);
      } catch (error) {
        if (roomRef.current !== room) return;
        console.error("Failed to connect LiveKit room:", error);
        let detail = error instanceof Error ? error.message : "LiveKit connection failed";
        if (error instanceof ConnectionError) {
          const serverReason =
            typeof error.context === "number" ? ` / server: ${DisconnectReason[error.context]}` : "";
          detail = `${detail} [${error.reasonName}${serverReason}]`;
        }
        onError(detail);
      }
    };

    void connectToLiveKit();
  }, [onError, roomRef, session]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === classroomRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (classroomRef.current?.requestFullscreen) {
        await classroomRef.current.requestFullscreen();
      }
    } catch (error) {
      console.warn("[live-class] fullscreen unavailable:", error);
    }
  }, []);

  const participantCount = liveParticipants.length;
  const connected = connectionState === ConnectionState.Connected;
  const reconnecting =
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting;

  const localParticipant = liveParticipants.find((participant) => participant.isLocal) ?? null;
  const hostParticipant =
    liveParticipants.find((participant) => participant.identity.startsWith("mentor_")) ?? null;

  const stageParticipant =
    screenSharingParticipant ??
    (role === "mentor" ? localParticipant : hostParticipant);

  const stageSource = screenSharingParticipant
    ? Track.Source.ScreenShare
    : Track.Source.Camera;

  const cameraTiles = liveParticipants.filter(
    (participant) =>
      hasLiveCamera(participant) &&
      !(stageSource === Track.Source.Camera && participant === stageParticipant),
  );

  const runMediaToggle = async (action: (local: LocalParticipant) => Promise<unknown>) => {
    const room = roomRef.current;
    if (!room) return;
    setActionError(null);
    try {
      await action(room.localParticipant);
    } catch (error) {
      console.error("LiveKit media toggle failed:", error);
      setActionError(error instanceof Error ? error.message : "Could not change your media settings.");
    } finally {
      syncRoomState();
    }
  };

  const handleToggleMic = () =>
    runMediaToggle((local) => local.setMicrophoneEnabled(!local.isMicrophoneEnabled));

  const handleToggleCamera = () =>
    runMediaToggle((local) => local.setCameraEnabled(!local.isCameraEnabled));

  const handleToggleScreenShare = () =>
    runMediaToggle((local) => local.setScreenShareEnabled(!local.isScreenShareEnabled));

  const handleEnableAudio = async () => {
    try {
      await roomRef.current?.startAudio();
    } finally {
      syncRoomState();
    }
  };

  const handleRaiseHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    emitRaiseHand({
      liveClassId: session.liveClassId,
      userName: session.userName,
      raised: next,
    });
  };

  const handleSendChat = () => {
    const message = chatInput.trim();
    if (!message) return;

    emitChatMessage({
      liveClassId: session.liveClassId,
      userName: session.userName,
      message,
    });

    setChatInput("");
  };

  const handleLeaveOrEnd = async () => {
    if (leaving) return;
    setLeaving(true);
    setActionError(null);
    try {
      await onLeaveOrEnd();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not leave the class.");
      setLeaving(false);
    }
  };

  const connectionLabel = connectionLabelFor(connectionState);

  return (
    <div
      ref={classroomRef}
      className={cn(
        "fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-[#030712] text-white",
        minimizedToDashboard && "hidden",
      )}
    >
      <RemoteAudio participants={liveParticipants} />

      {actionError && (
        <div className="absolute inset-x-0 top-0 z-[100] flex items-center justify-between gap-3 bg-red-600 px-4 py-2 text-sm text-white">
          <span className="min-w-0 truncate">{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <header className="flex min-h-[62px] shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-[#050816]/95 px-2.5 py-2.5 backdrop-blur-md sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMinimizeToDashboard}
            aria-label="Minimize classroom"
            title="Minimize"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
          >
            −
          </button>

          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="max-w-[42vw] truncate text-sm font-bold sm:max-w-none sm:text-base">
                {title}
              </h1>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[9px] font-bold uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                Live
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/60 sm:text-xs">
              {connectionState === ConnectionState.Connected ? (
                <><Wifi size={12} className="text-emerald-400" /> Connected</>
              ) : (
                <><WifiOff size={12} className="text-amber-400" /> {connectionLabel}</>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setChatOpen((v) => !v)}
            className={cn(
              "relative flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
              chatOpen ? "border-blue-400/40 bg-blue-500/15 text-white" : "border-white/10 bg-white/5 text-white/80",
            )}
          >
            <MessageSquare size={15} />
            <span className="hidden sm:inline">Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setParticipantsOpen((v) => !v)}
            className={cn(
              "relative flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold",
              participantsOpen ? "border-blue-400/40 bg-blue-500/15 text-white" : "border-white/10 bg-white/5 text-white/80",
            )}
          >
            <Users size={15} />
            <span className="hidden sm:inline">Participants</span>
            <span>({participantCount})</span>
          </button>

          <button
            type="button"
            onClick={handleLeaveOrEnd}
            disabled={leaving}
            className="flex h-9 items-center gap-1.5 rounded-full bg-red-600 px-3 text-xs font-semibold hover:bg-red-500 disabled:opacity-60"
          >
            {role === "mentor" ? <PhoneOff size={15} /> : <LogOut size={15} />}
            <span className="hidden sm:inline">{role === "mentor" ? "End Class" : "Leave"}</span>
          </button>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 gap-2 overflow-hidden p-2 sm:gap-3 sm:p-3">
        <section className="relative min-h-0 min-w-0 flex-1 overflow-hidden rounded-xl border border-white/10 bg-black sm:rounded-2xl">
          {stageParticipant ? (
            <ParticipantVideo
              key={`${stageParticipant.identity}-${stageSource}`}
              participant={stageParticipant}
              source={stageSource}
              fit={stageSource === Track.Source.ScreenShare ? "contain" : "cover"}
              mirror={stageParticipant.isLocal && stageSource === Track.Source.Camera}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-950 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-bold">
                  {role === "mentor" ? session.userName.charAt(0).toUpperCase() : "M"}
                </div>
                <p className="text-sm text-white/60">
                  {role === "mentor" ? "Your classroom is ready" : "Waiting for the mentor to join…"}
                </p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 z-20 flex max-w-[70%] items-center gap-2">
            {screenSharingParticipant && (
              <span className="truncate rounded-full bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold shadow-lg">
                {getParticipantName(screenSharingParticipant)} is sharing
              </span>
            )}
            {isScreenSharing && (
              <span className="rounded-full bg-emerald-600/90 px-3 py-1.5 text-xs font-semibold shadow-lg">
                You are sharing
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen" : "Full screen"}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl bg-black/60 text-white backdrop-blur hover:bg-black/80"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {stageParticipant && (
            <div className="absolute bottom-3 left-3 max-w-[70%] truncate rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium backdrop-blur">
              {getParticipantName(stageParticipant)}
            </div>
          )}

          {reconnecting && (
            <div className="absolute inset-x-0 top-0 z-20 bg-amber-500 px-3 py-1.5 text-center text-xs font-semibold text-black">
              Connection unstable — reconnecting…
            </div>
          )}

          {connected && !canPlayAudio && (
            <button
              type="button"
              onClick={handleEnableAudio}
              className="absolute left-1/2 top-14 z-20 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold shadow-lg"
            >
              🔊 Tap to enable class audio
            </button>
          )}

          {cameraTiles.length > 0 && (
            <div className="absolute bottom-3 right-3 z-20 flex max-w-[72%] gap-2 overflow-x-auto rounded-xl p-1">
              {cameraTiles.map((participant) => (
                <div
                  key={participant.identity}
                  className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-slate-900 shadow-lg sm:h-24 sm:w-36"
                >
                  <ParticipantVideo participant={participant} source={Track.Source.Camera} mirror={participant.isLocal} />
                  <div className="absolute inset-x-0 bottom-0 truncate bg-black/65 px-2 py-1 text-[10px] font-medium">
                    {getParticipantName(participant)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {participantsOpen && (
          <aside className="hidden w-[300px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020] lg:flex lg:flex-col xl:w-[330px]">
            <ParticipantList participants={liveParticipants} />
          </aside>
        )}
      </main>

      <footer className="relative z-40 flex shrink-0 items-center justify-center border-t border-white/10 bg-[#050816]/95 px-2 py-2.5 backdrop-blur-md sm:py-3">
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] sm:gap-2.5 [&::-webkit-scrollbar]:hidden">
          <ControlButton
            label={isMuted ? "Unmute" : "Mute"}
            onClick={handleToggleMic}
            disabled={isJoining || !connected}
            active={!isMuted}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </ControlButton>

          <ControlButton
            label={isVideoEnabled ? "Stop video" : "Start video"}
            onClick={handleToggleCamera}
            disabled={isJoining || !connected}
            active={isVideoEnabled}
          >
            {isVideoEnabled ? <Video size={18} /> : <VideoOff size={18} />}
          </ControlButton>

          <ControlButton label={isHandRaised ? "Lower hand" : "Raise hand"} onClick={handleRaiseHand} active={isHandRaised}>
            <Hand size={18} />
          </ControlButton>

          <ControlButton
            label={isScreenSharing ? "Stop sharing" : "Share screen"}
            onClick={handleToggleScreenShare}
            disabled={isJoining || !connected}
            active={isScreenSharing}
          >
            {isScreenSharing ? <ScreenShareOff size={18} /> : <ScreenShare size={18} />}
          </ControlButton>

          <ControlButton label={isFullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </ControlButton>

          <ControlButton label="Chat" onClick={() => setChatOpen((v) => !v)} active={chatOpen}>
            <MessageSquare size={18} />
          </ControlButton>

          <button
            type="button"
            onClick={handleLeaveOrEnd}
            disabled={leaving}
            className="ml-1 flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-4 text-xs font-semibold hover:bg-red-500 disabled:opacity-60 sm:h-12 sm:px-5 sm:text-sm"
          >
            {role === "mentor" ? <PhoneOff size={17} /> : <LogOut size={17} />}
            <span className="hidden sm:inline">{role === "mentor" ? "End Class" : "Leave"}</span>
          </button>
        </div>
      </footer>

      {participantsOpen && (
        <div className="fixed inset-x-2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[90] max-h-[65dvh] overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/98 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <Users size={17} />
              Participants ({participantCount})
            </div>
            <button type="button" onClick={() => setParticipantsOpen(false)} className="text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[calc(65dvh-55px)] overflow-y-auto">
            <ParticipantList participants={liveParticipants} compact />
          </div>
        </div>
      )}

      {chatOpen && (
        <div className="fixed inset-x-2 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[100] flex h-[min(68dvh,520px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#080d1c]/98 shadow-2xl backdrop-blur-xl lg:inset-x-auto lg:right-4 lg:top-[78px] lg:bottom-[76px] lg:h-auto lg:w-[380px]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-semibold">Class chat</div>
              <div className="text-[10px] text-white/45">Messages are shared with everyone in this class</div>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-white/45">
                No messages yet. Say hello 👋
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex w-full",
                    message.isMine ? "justify-end" : "justify-start",
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-3 py-2",
                      message.isMine ? "rounded-br-md bg-blue-600" : "rounded-bl-md bg-white/[0.07]",
                    )}
                  >
                    <div className={cn("mb-0.5 text-[10px] font-semibold", message.isMine ? "text-blue-100" : "text-white/55")}>
                      {message.isMine ? "You" : message.sender}
                    </div>
                    <div className="break-words text-sm leading-relaxed">{message.message}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            className="flex shrink-0 items-center gap-2 border-t border-white/10 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSendChat();
            }}
          >
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              placeholder="Type a message…"
              className="h-10 min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/50"
            />
            <button type="submit" className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold hover:bg-blue-500">
              <Send size={15} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const ControlButton = ({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-white transition sm:h-12 sm:w-12",
      disabled
        ? "cursor-not-allowed border-white/5 bg-white/5 text-white/25"
        : active
          ? "border-blue-400/50 bg-blue-500/20"
          : "border-white/10 bg-white/5 hover:bg-white/10",
    )}
  >
    {children}
  </button>
);

const ParticipantList = ({
  participants,
  compact = false,
}: {
  participants: Participant[];
  compact?: boolean;
}) => (
  <div className={cn("min-h-0 space-y-2 overflow-y-auto p-3", compact && "p-3")}>
    {participants.map((participant) => {
      const name = getParticipantName(participant);
      const roleLabel = participant.identity.startsWith("mentor_") ? "Mentor" : "Student";
      return (
        <div
          key={participant.identity}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase">
            {name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{name}</span>
              {participant.isLocal && (
                <span className="shrink-0 rounded bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300">
                  You
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-white/45">
              <span>{roleLabel}</span>
              {participant.isSpeaking && <span className="text-emerald-300">Speaking</span>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 text-white/60">
            {participant.isMicrophoneEnabled ? <Mic size={14} /> : <MicOff size={14} />}
            {participant.isCameraEnabled ? <Video size={14} /> : <VideoOff size={14} />}
          </div>
        </div>
      );
    })}
  </div>
);
