import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 900;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface UseCountUpOptions {
  durationMs?: number;
  reduceMotion?: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { durationMs = DEFAULT_DURATION_MS, reduceMotion } = options;
  const reduced = reduceMotion ?? prefersReducedMotion();

  const [value, setValue] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const from = currentRef.current;

    if (reduced || from === target) {
      currentRef.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(from + (target - from) * eased);

      currentRef.current = next;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [durationMs, reduced, target]);

  return value;
}
