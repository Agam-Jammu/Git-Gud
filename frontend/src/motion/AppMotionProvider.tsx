import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export interface AppMotionProviderProps {
  children: ReactNode;
}

export function AppMotionProvider({ children }: AppMotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
