import { motion } from "motion/react";

import { categoryTheme } from "../theme/categoryTheme";
import { blendRgb, cssRgb, urgencyBlend } from "../theme/colour";

export interface CountdownProps {
  secondsRemaining: number;
}

const CALM_RGB = categoryTheme(null).accentRgb;
const URGENT_RGB = "239 77 91";

export function Countdown({ secondsRemaining }: CountdownProps) {
  const colour = cssRgb(blendRgb(CALM_RGB, URGENT_RGB, urgencyBlend(secondsRemaining)));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <p className="text-sm uppercase tracking-[0.4em] text-slate-400">Get ready</p>

      <div className="relative flex h-48 w-48 items-center justify-center">
        <span
          aria-hidden="true"
          data-testid="countdown-ring"
          className="absolute inset-0 animate-pulse-ring rounded-full border-2"
          style={{ borderColor: colour }}
        />
        <motion.p
          key={secondsRemaining}
          initial={{ opacity: 0, scale: 0.55 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="text-8xl font-bold tabular-nums"
          style={{ color: colour }}
        >
          {secondsRemaining}
        </motion.p>
      </div>
    </main>
  );
}
