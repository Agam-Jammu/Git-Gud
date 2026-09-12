import { motion } from "motion/react";

import { liftOnHover, staggerContainer, staggerItem } from "../motion/presets";
import type { PlayerDto } from "../types";
import { CelebrationBurst } from "./CelebrationBurst";
import { ScoreCountUp } from "./ScoreCountUp";

export interface PodiumProps {
  standings: PlayerDto[];
  playerName: string | null;
  isHost: boolean;
  onPlayAgain: () => void;
  onLeave: () => void;
}

export function ordinal(position: number): string {
  const withinTeens = position % 100;

  if (withinTeens >= 11 && withinTeens <= 13) {
    return `${position}th`;
  }

  switch (position % 10) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}

export function Podium({ standings, playerName, isHost, onPlayAgain, onLeave }: PodiumProps) {
  const winner = standings[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Final results</p>
        <h1 className="cat-gradient-text mt-2 text-5xl font-bold">
          {winner ? `${winner.name} wins` : "No players"}
        </h1>
      </header>

      <motion.ol
        aria-label="Final standings"
        className="flex w-full max-w-2xl flex-col gap-2"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {standings.map((player, index) => {
          const champion = index === 0;

          return (
            <motion.li
              key={`${index}-${player.name}`}
              variants={staggerItem}
              className={`relative flex items-center justify-between rounded-md border px-4 py-3 ${
                champion
                  ? "border-arena-correct shadow-[0_0_34px_-8px_rgb(47_191_113/0.85)]"
                  : "border-arena-border"
              }`}
            >
              {champion ? <CelebrationBurst /> : null}

              <span className="flex items-center gap-3">
                <span className="w-10 text-xs uppercase tracking-widest text-slate-400">
                  {ordinal(index + 1)}
                </span>
                <span className={champion ? "font-semibold text-arena-correct" : "text-slate-100"}>
                  {player.name}
                </span>
                {player.name === playerName ? (
                  <span className="text-xs uppercase tracking-widest text-slate-500">You</span>
                ) : null}
              </span>

              <ScoreCountUp value={player.score} />
            </motion.li>
          );
        })}
      </motion.ol>

      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <motion.button
            type="button"
            onClick={onPlayAgain}
            className="sheen cat-fill rounded-md px-6 py-2 font-semibold text-arena-background"
            {...liftOnHover}
          >
            Play again
          </motion.button>
        ) : (
          <p className="text-sm text-slate-400">Waiting for the host to start a rematch</p>
        )}

        <button type="button" onClick={onLeave} className="text-sm text-slate-400 underline">
          Leave room
        </button>
      </div>
    </main>
  );
}
