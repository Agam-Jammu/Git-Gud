import type { PlayerDto } from "../types";

export interface PodiumProps {
  standings: PlayerDto[];
  playerName: string | null;
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

export function Podium({ standings, playerName, onLeave }: PodiumProps) {
  const winner = standings[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Final results</p>
        <h1 className="mt-2 text-4xl font-semibold text-arena-accent">
          {winner ? `${winner.name} wins` : "No players"}
        </h1>
      </header>

      <ol aria-label="Final standings" className="flex w-full max-w-2xl flex-col gap-2">
        {standings.map((player, index) => (
          <li
            key={`${index}-${player.name}`}
            className={`flex items-center justify-between rounded-md border px-4 py-3 ${
              index === 0 ? "border-arena-correct" : "border-arena-border"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="w-10 text-xs uppercase tracking-widest text-slate-400">
                {ordinal(index + 1)}
              </span>
              <span
                className={index === 0 ? "font-semibold text-arena-correct" : "text-slate-100"}
              >
                {player.name}
              </span>
              {player.name === playerName ? (
                <span className="text-xs uppercase tracking-widest text-slate-500">You</span>
              ) : null}
            </span>

            <span className="tabular-nums text-slate-300">
              {player.score.toLocaleString("en-US")}
            </span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onLeave}
        className="rounded-md border border-arena-accent px-6 py-2 font-semibold text-arena-accent"
      >
        Leave room
      </button>
    </main>
  );
}
