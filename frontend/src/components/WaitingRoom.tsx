import { useState } from "react";

import type { PlayerDto } from "../types";

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
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Room code</p>
        <h1 className="text-5xl font-bold tracking-[0.3em] text-arena-accent">{roomCode}</h1>
      </header>

      <div className="flex w-full max-w-sm items-center gap-2">
        <input
          aria-label="Share link"
          readOnly
          value={shareUrl}
          className="flex-1 rounded-md border border-arena-border bg-arena-background px-3 py-2 text-sm text-slate-300 outline-none"
        />
        <button
          type="button"
          onClick={() => void copyLink()}
          className="rounded-md border border-arena-accent px-3 py-2 text-sm font-semibold text-arena-accent"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>

      <section className="w-full max-w-sm rounded-xl border border-arena-border bg-arena-surface p-6">
        <h2 className="text-sm uppercase tracking-widest text-slate-400">
          Players ({players.length})
        </h2>

        <ul className="mt-4 flex flex-col gap-2">
          {players.map((player, index) => (
            <li
              key={`${index}-${player.name}`}
              className="flex items-center justify-between rounded-md border border-arena-border px-3 py-2"
            >
              <span className="text-slate-100">{player.name}</span>
              {player.host ? (
                <span className="text-xs uppercase tracking-widest text-arena-accent">Host</span>
              ) : null}
            </li>
          ))}
        </ul>

        {!connected ? <p className="mt-4 text-sm text-slate-400">Connecting to the room...</p> : null}

        {error ? (
          <p role="alert" className="mt-4 text-sm text-arena-wrong">
            {error}
          </p>
        ) : null}
      </section>

      <div className="flex flex-col items-center gap-3">
        {isHost ? (
          <button
            type="button"
            onClick={onStart}
            disabled={!connected}
            className="rounded-md bg-arena-accent px-6 py-2 font-semibold text-arena-background disabled:opacity-40"
          >
            Start match
          </button>
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
