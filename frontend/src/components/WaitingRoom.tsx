import { motion } from "motion/react";
import { useState } from "react";

import { fadeRise, liftOnHover } from "../motion/presets";
import type { PlayerDto } from "../types";

const ROW_ENTRANCE_SECONDS = 0.38;
const ROW_STAGGER_SECONDS = 0.07;

export interface WaitingRoomProps {
  roomCode: string;
  players: PlayerDto[];
  connected: boolean;
  isHost: boolean;
  error?: string | null;
  onStart: () => void;
  onLeave: () => void;
}

export function WaitingRoom({
  roomCode,
  players,
  connected,
  isHost,
  error,
  onStart,
  onLeave,
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomCode}`;

  async function copyLink() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
    setCopied(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <motion.header
        className="text-center"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Room code</p>
        <h1 className="cat-gradient-text mt-2 text-5xl font-bold tracking-[0.3em]">{roomCode}</h1>
      </motion.header>

      <motion.div
        className="cat-panel flex w-full max-w-sm items-center gap-2 p-3"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        <input
          aria-label="Share link"
          readOnly
          value={shareUrl}
          className="flex-1 rounded-md border border-arena-border bg-arena-background/70 px-3 py-2 text-sm text-slate-300 outline-none"
        />
        <motion.button
          type="button"
          onClick={() => void copyLink()}
          className="sheen cat-fill rounded-md px-3 py-2 text-sm font-semibold text-arena-background"
          {...liftOnHover}
        >
          {copied ? "Copied" : "Copy link"}
        </motion.button>
      </motion.div>

      <motion.section
        className="cat-panel w-full max-w-sm p-6"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-sm uppercase tracking-widest text-slate-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: ROW_ENTRANCE_SECONDS, ease: [0.16, 1, 0.3, 1] }}
        >
          Players ({players.length})
        </motion.h2>

        <ul className="mt-4 flex flex-col gap-2">
          {players.map((player, index) => (
            <motion.li
              key={`${index}-${player.name}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: ROW_ENTRANCE_SECONDS,
                delay: index * ROW_STAGGER_SECONDS,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex items-center justify-between rounded-md border border-arena-border px-3 py-2"
            >
              <span className="text-slate-100">{player.name}</span>
              {player.host ? (
                <span className="text-xs uppercase tracking-widest text-arena-accent">Host</span>
              ) : null}
            </motion.li>
          ))}
        </ul>

        {!connected ? <p className="mt-4 text-sm text-slate-400">Connecting to the room...</p> : null}

        {error ? (
          <p role="alert" className="mt-4 text-sm text-arena-wrong">
            {error}
          </p>
        ) : null}
      </motion.section>

      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <motion.button
            type="button"
            onClick={onStart}
            disabled={!connected}
            className="sheen cat-fill rounded-md px-6 py-2 font-semibold text-arena-background disabled:opacity-60"
            {...liftOnHover}
          >
            Start match
          </motion.button>
        ) : (
          <p className="text-sm text-slate-400">Waiting for the host to start the match</p>
        )}

        <button type="button" onClick={onLeave} className="text-sm text-slate-400 underline">
          Leave room
        </button>
      </div>
    </main>
  );
}
