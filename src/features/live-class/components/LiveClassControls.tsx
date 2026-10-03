// /**
//  * src/features/live-class/components/LiveClassControls.tsx
//  *
//  * Bottom control bar for the redesigned Live Classroom, matching the
//  * reference design: Mute/Unmute, Start/Stop Video, Raise Hand, Share
//  * Screen, More, then a visually separated red Leave/End button.
//  *
//  * Chat and Participants have moved to LiveClassHeader per the spec ("Top
//  * Header ... Chat button, Participants button"), so they are NOT
//  * duplicated here.
//  *
//  * All handlers are passed in — this component only renders the bar and
//  * reflects state, it never talks to the Zoom SDK directly.
//  */
// import { useState, useRef, useEffect } from "react";
// import {
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
//   Hand,
//   ScreenShare,
//   ScreenShareOff,
//   MoreHorizontal,
//   PhoneOff,
//   LogOut,
//   Maximize,
//   Minimize,
//   Minimize2,
// } from "lucide-react";
// import { cn } from "@/lib/utils";

// interface LiveClassControlsProps {
//   role: "mentor" | "student";

//   isMuted: boolean;
//   onToggleMic: () => void;

//   isVideoEnabled: boolean;
//   onToggleVideo: () => void;

//   isHandRaised: boolean;
//   onToggleRaiseHand: () => void;

//   isScreenSharing: boolean;
//   onToggleScreenShare?: () => void;
//   /** Screen share is typically a mentor-only action. */
//   canShareScreen?: boolean;

//   /**
//    * True while the underlying Zoom media stream isn't ready yet (still
//    * joining or reconnecting). Greys out and disables just the Mic/Video/
//    * Share buttons so they can't be clicked into a null stream — Raise
//    * Hand, Fullscreen, and Leave/End stay usable throughout.
//    */
//   mediaControlsDisabled?: boolean;

//   isFullscreen: boolean;
//   onToggleFullscreen: () => void;
//   onMinimizeToDashboard?: () => void;

//   onLeaveOrEnd: () => void;
// }

// const CircleButton = ({
//   active,
//   danger,
//   disabled,
//   onClick,
//   label,
//   children,
// }: {
//   active?: boolean;
//   danger?: boolean;
//   disabled?: boolean;
//   onClick: () => void;
//   label: string;
//   children: React.ReactNode;
// }) => (
//   <button
//     type="button"
//     onClick={disabled ? undefined : onClick}
//     disabled={disabled}
//     aria-label={label}
//     aria-pressed={active}
//     aria-disabled={disabled}
//     title={disabled ? "Connecting…" : label}
//     className={cn(
//       "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0037FF] sm:h-12 sm:w-12",
//       disabled
//         ? "cursor-not-allowed bg-white/5 text-white/30"
//         : danger
//         ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
//         : active
//         ? "bg-white/90 text-black hover:bg-white"
//         : "bg-white/10 text-white hover:bg-white/20"
//     )}
//   >
//     {children}
//   </button>
// );

// export const LiveClassControls = ({
//   role,
//   isMuted,
//   onToggleMic,
//   isVideoEnabled,
//   onToggleVideo,
//   isHandRaised,
//   onToggleRaiseHand,
//   isScreenSharing,
//   onToggleScreenShare,
//   canShareScreen = true,
//   mediaControlsDisabled = false,
//   isFullscreen,
//   onToggleFullscreen,
//   onMinimizeToDashboard,
//   onLeaveOrEnd,
// }: LiveClassControlsProps) => {
//   const [moreOpen, setMoreOpen] = useState(false);
//   const moreRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!moreOpen) return;
//     const handler = (e: MouseEvent) => {
//       if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, [moreOpen]);

//   return (
//     <div
//       className="relative flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-[#0b0d12]/95 px-2.5 py-2.5 backdrop-blur-md sm:gap-3 sm:py-3"
//       style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
//       /* Marker so LiveClassShell's proxy-click search (which scans the
//          same DOM subtree for Zoom's *real* toolbar buttons) can exclude
//          our own Mic/Video/Share buttons — their labels ("Share Screen"
//          etc.) would otherwise self-match and click our own button
//          instead of Zoom's. */
//       data-slate-live-controls="true"
//     >
//       <div className="flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
//         <CircleButton
//           active={!isMuted}
//           disabled={mediaControlsDisabled}
//           onClick={onToggleMic}
//           label={isMuted ? "Unmute" : "Mute"}
//         >
//           {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
//         </CircleButton>

//         <CircleButton
//           active={isVideoEnabled}
//           disabled={mediaControlsDisabled}
//           onClick={onToggleVideo}
//           label={isVideoEnabled ? "Stop Video" : "Start Video"}
//         >
//           {isVideoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
//         </CircleButton>

//         <CircleButton active={isHandRaised} onClick={onToggleRaiseHand} label="Raise Hand">
//           <Hand size={19} />
//         </CircleButton>

//         {canShareScreen && (
//           <CircleButton
//             active={isScreenSharing}
//             disabled={mediaControlsDisabled}
//             onClick={() => onToggleScreenShare?.()}
//             label={isScreenSharing ? "Stop Sharing" : "Share Screen"}
//           >
//             {isScreenSharing ? <ScreenShareOff size={19} /> : <ScreenShare size={19} />}
//           </CircleButton>
//         )}

//         {/* Minimize — now a primary, always-visible button for the mentor
//             (previously buried inside the "More" overflow menu, which meant
//             an extra tap through a menu just to minimize mid-class). */}
//         {role === "mentor" && onMinimizeToDashboard && (
//           <CircleButton onClick={onMinimizeToDashboard} label="Minimize to Dashboard">
//             <Minimize2 size={19} />
//           </CircleButton>
//         )}

//         <div ref={moreRef} className="relative">
//           <CircleButton active={moreOpen} onClick={() => setMoreOpen((v) => !v)} label="More">
//             <MoreHorizontal size={19} />
//           </CircleButton>

//           {moreOpen && (
//             <div className="absolute bottom-14 left-1/2 z-30 w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-[#151821] p-1.5 shadow-2xl sm:bottom-16">
//               <button
//                 type="button"
//                 onClick={() => {
//                   onToggleFullscreen();
//                   setMoreOpen(false);
//                 }}
//                 className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
//               >
//                 {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
//                 {isFullscreen ? "Exit full screen" : "Full screen"}
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="mx-1 h-8 w-px shrink-0 bg-white/10" />

//         <button
//           type="button"
//           onClick={onLeaveOrEnd}
//           aria-label={role === "mentor" ? "End class for everyone" : "Leave class"}
//           title={role === "mentor" ? "End class for everyone" : "Leave class"}
//           className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 sm:h-12"
//         >
//           {role === "mentor" ? <PhoneOff size={17} /> : <LogOut size={17} />}
//           <span className="hidden sm:inline">{role === "mentor" ? "End Class" : "Leave"}</span>
//         </button>
//       </div>
//     </div>
//   );
// };








/**
 * src/features/live-class/components/LiveClassControls.tsx
 *
 * Bottom control bar for the redesigned Live Classroom, matching the
 * reference design: Mute/Unmute, Start/Stop Video, Raise Hand, Share
 * Screen, More, then a visually separated red Leave/End button.
 *
 * Chat and Participants have moved to LiveClassHeader per the spec ("Top
 * Header ... Chat button, Participants button"), so they are NOT
 * duplicated here.
 *
 * All handlers are passed in — this component only renders the bar and
 * reflects state, it never talks to the Zoom SDK directly.
 */
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  ScreenShare,
  ScreenShareOff,
  MoreHorizontal,
  PhoneOff,
  LogOut,
  Maximize,
  Minimize,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClassControlsProps {
  role: "mentor" | "student";

  isMuted: boolean;
  onToggleMic: () => void;

  isVideoEnabled: boolean;
  onToggleVideo: () => void;

  isHandRaised: boolean;
  onToggleRaiseHand: () => void;

  /** Reflects whether *this* user is currently sharing (not "is anyone"). */
  isScreenSharing: boolean;
  onToggleScreenShare?: () => void;
  /** Both mentor and student may present, one at a time. */
  canShareScreen?: boolean;
  /** True when someone ELSE is already presenting — greys out and blocks
   * starting a new share until they stop, preventing duplicate shares. */
  screenShareBlocked?: boolean;

  /**
   * True while the underlying Zoom media stream isn't ready yet (still
   * joining or reconnecting). Greys out and disables just the Mic/Video/
   * Share buttons so they can't be clicked into a null stream — Raise
   * Hand, Fullscreen, and Leave/End stay usable throughout.
   */
  mediaControlsDisabled?: boolean;

  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onMinimizeToDashboard?: () => void;

  onLeaveOrEnd: () => void;
}

const CircleButton = ({
  active,
  danger,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    aria-label={label}
    aria-pressed={active}
    aria-disabled={disabled}
    title={disabled ? "Connecting…" : label}
    className={cn(
      "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0037FF] sm:h-12 sm:w-12",
      disabled
        ? "cursor-not-allowed bg-white/5 text-white/30"
        : danger
        ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
        : active
        ? "bg-white/90 text-black hover:bg-white"
        : "bg-white/10 text-white hover:bg-white/20"
    )}
  >
    {children}
  </button>
);

export const LiveClassControls = ({
  role,
  isMuted,
  onToggleMic,
  isVideoEnabled,
  onToggleVideo,
  isHandRaised,
  onToggleRaiseHand,
  isScreenSharing,
  onToggleScreenShare,
  canShareScreen = true,
  screenShareBlocked = false,
  mediaControlsDisabled = false,
  isFullscreen,
  onToggleFullscreen,
  onMinimizeToDashboard,
  onLeaveOrEnd,
}: LiveClassControlsProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center gap-1 border-t border-white/10 bg-[#0b0d12]/95 px-2.5 py-2.5 backdrop-blur-md sm:gap-3 sm:py-3"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      /* Marker so LiveClassShell's proxy-click search (which scans the
         same DOM subtree for Zoom's *real* toolbar buttons) can exclude
         our own Mic/Video/Share buttons — their labels ("Share Screen"
         etc.) would otherwise self-match and click our own button
         instead of Zoom's. */
      data-slate-live-controls="true"
    >
      <div className="flex max-w-full flex-nowrap items-center gap-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 [&::-webkit-scrollbar]:hidden">
        <CircleButton
          active={!isMuted}
          disabled={mediaControlsDisabled}
          onClick={onToggleMic}
          label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
        </CircleButton>

        <CircleButton
          active={isVideoEnabled}
          disabled={mediaControlsDisabled}
          onClick={onToggleVideo}
          label={isVideoEnabled ? "Stop Video" : "Start Video"}
        >
          {isVideoEnabled ? <Video size={19} /> : <VideoOff size={19} />}
        </CircleButton>

        <CircleButton active={isHandRaised} onClick={onToggleRaiseHand} label="Raise Hand">
          <Hand size={19} />
        </CircleButton>

        {canShareScreen && (
          <CircleButton
            active={isScreenSharing}
            disabled={mediaControlsDisabled || screenShareBlocked}
            onClick={() => onToggleScreenShare?.()}
            label={
              screenShareBlocked
                ? "Someone else is presenting"
                : isScreenSharing
                ? "Stop Sharing"
                : "Share Screen"
            }
          >
            {isScreenSharing ? <ScreenShareOff size={19} /> : <ScreenShare size={19} />}
          </CircleButton>
        )}

        {/* Minimize — now a primary, always-visible button for the mentor
            (previously buried inside the "More" overflow menu, which meant
            an extra tap through a menu just to minimize mid-class). */}
        {role === "mentor" && onMinimizeToDashboard && (
          <CircleButton onClick={onMinimizeToDashboard} label="Minimize to Dashboard">
            <Minimize2 size={19} />
          </CircleButton>
        )}

        <div ref={moreRef} className="relative">
          <CircleButton active={moreOpen} onClick={() => setMoreOpen((v) => !v)} label="More">
            <MoreHorizontal size={19} />
          </CircleButton>

          {moreOpen && (
            <div className="absolute bottom-14 left-1/2 z-30 w-52 -translate-x-1/2 rounded-xl border border-white/10 bg-[#151821] p-1.5 shadow-2xl sm:bottom-16">
              <button
                type="button"
                onClick={() => {
                  onToggleFullscreen();
                  setMoreOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
              >
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                {isFullscreen ? "Exit full screen" : "Full screen"}
              </button>
            </div>
          )}
        </div>

        <div className="mx-1 h-8 w-px shrink-0 bg-white/10" />

        <button
          type="button"
          onClick={onLeaveOrEnd}
          aria-label={role === "mentor" ? "End class for everyone" : "Leave class"}
          title={role === "mentor" ? "End class for everyone" : "Leave class"}
          className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-300 sm:h-12"
        >
          {role === "mentor" ? <PhoneOff size={17} /> : <LogOut size={17} />}
          <span className="hidden sm:inline">{role === "mentor" ? "End Class" : "Leave"}</span>
        </button>
      </div>
    </div>
  );
};