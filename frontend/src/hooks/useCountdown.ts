import { useEffect, useState } from "react";

function secondsUntil(deadlineEpochMs: number): number {
  return Math.max(0, Math.ceil((deadlineEpochMs - Date.now()) / 1000));
}

export function useCountdown(deadlineEpochMs: number): number {
  const [secondsRemaining, setSecondsRemaining] = useState(() => secondsUntil(deadlineEpochMs));

  useEffect(() => {
    setSecondsRemaining(secondsUntil(deadlineEpochMs));

    const interval = window.setInterval(() => {
      setSecondsRemaining(secondsUntil(deadlineEpochMs));
    }, 200);

    return () => window.clearInterval(interval);
  }, [deadlineEpochMs]);

  return secondsRemaining;
}
