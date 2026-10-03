import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: Date | null;
  onComplete?: () => void;
}

export const CountdownTimer = ({ targetDate, onComplete }: CountdownTimerProps) => {
  const [remaining, setRemaining] = useState<string>("--:--:--");

  useEffect(() => {
    if (!targetDate) return;

    const tick = () => {
      const diffMs = targetDate.getTime() - Date.now();
      if (diffMs <= 0) {
        setRemaining("00:00:00");
        onComplete?.();
        return;
      }
      const h = Math.floor(diffMs / 3_600_000);
      const m = Math.floor((diffMs % 3_600_000) / 60_000);
      const s = Math.floor((diffMs % 60_000) / 1000);
      setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (!targetDate) return null;

  return <span className="font-mono text-sm font-semibold tabular-nums">{remaining}</span>;
};