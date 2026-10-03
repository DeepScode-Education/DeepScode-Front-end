/**
 * src/features/live-class/components/ElapsedTimer.tsx
 *
 * Counts UP from `startedAt` — used in the classroom header next to the
 * LIVE badge (`01:24:35`). Separate from the existing CountdownTimer
 * (which counts down to a target date) — different direction, different
 * use case, so kept as its own tiny component rather than overloading one
 * component with a `direction` prop.
 */
import { useEffect, useState } from "react";

interface ElapsedTimerProps {
  startedAt: Date | null;
}

const pad = (n: number) => String(n).padStart(2, "0");

export const ElapsedTimer = ({ startedAt }: ElapsedTimerProps) => {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00:00");
      return;
    }

    const tick = () => {
      const diffMs = Date.now() - startedAt.getTime();
      const totalSeconds = Math.max(Math.floor(diffMs / 1000), 0);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      setElapsed(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span className="font-mono text-[11px] font-medium tabular-nums text-white/70 sm:text-xs">
      {elapsed}
    </span>
  );
};