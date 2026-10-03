/**
 * src/features/live-class/components/ClassroomPlaceholder.tsx
 *
 * Bottom of the display-priority chain: Teacher Screen Share > Teacher
 * Camera > Classroom Placeholder. Shown only while the mentor is
 * connected but has neither camera nor screen share on — never shown
 * once either turns on (MainStage swaps it out for the SDK's own canvas
 * at that point).
 */
import { GraduationCap } from "lucide-react";

interface ClassroomPlaceholderProps {
  mentorName: string;
}

export const ClassroomPlaceholder = ({ mentorName }: ClassroomPlaceholderProps) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#111318] to-black text-white/60">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 sm:h-20 sm:w-20">
      <GraduationCap size={30} className="text-white/40" />
    </div>
    <div className="text-center">
      <p className="text-sm font-semibold text-white/80">Waiting for {mentorName}</p>
      <p className="mt-1 text-xs text-white/40">Camera and screen share are both off right now</p>
    </div>
  </div>
);