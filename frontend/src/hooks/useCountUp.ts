import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION_MS = 900;

export interface UseCountUpOptions {
  durationMs?: number;
  reduceMotion?: boolean;
}

export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
  const { durationMs = DEFAULT_DURATION_MS, reduceMotion } = options;
  const prefersReducedMotion = useReducedMotion();
  const reduced = reduceMotion ?? prefersReducedMotion ?? false;

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
