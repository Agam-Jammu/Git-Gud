import { motion } from "motion/react";

const PARTICLES = [
  { x: -70, y: -34, delay: 0 },
  { x: 76, y: -44, delay: 0.08 },
  { x: -54, y: 42, delay: 0.16 },
  { x: 84, y: 34, delay: 0.24 },
  { x: 4, y: -62, delay: 0.32 },
];

export function CelebrationBurst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {PARTICLES.map((particle) => (
        <motion.span
          key={`${particle.x}-${particle.y}`}
          className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-arena-correct"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: particle.x,
            y: particle.y,
            scale: [0.4, 1, 0.6],
          }}
          transition={{ duration: 1.6, delay: particle.delay, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}
