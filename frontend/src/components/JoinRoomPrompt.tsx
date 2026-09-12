import { useState, type FormEvent } from "react";

export interface JoinRoomPromptProps {
  roomCode: string;
  error: string | null;
  onJoin: (playerName: string) => Promise<void>;
}

export function JoinRoomPrompt({ roomCode, error, onJoin }: JoinRoomPromptProps) {
  const [playerName, setPlayerName] = useState("");
  const [busy, setBusy] = useState(false);

  const nameReady = playerName.trim().length > 0 && !busy;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await onJoin(playerName.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">You have been invited to</p>
        <h1 className="text-5xl font-bold tracking-[0.3em] text-arena-accent">{roomCode}</h1>
      </header>

      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-arena-border bg-arena-surface p-6"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col gap-2 text-sm text-slate-300" htmlFor="player-name">
          Your name
          <input
            id="player-name"
            className="rounded-md border border-arena-border bg-arena-background px-3 py-2 text-slate-100 outline-none focus:border-arena-accent"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            maxLength={20}
            autoComplete="off"
          />
        </label>

        <button
          type="submit"
          disabled={!nameReady}
          className="rounded-md bg-arena-accent px-4 py-2 font-semibold text-arena-background disabled:opacity-40"
        >
          Join this room
        </button>

        {error ? (
          <p role="alert" className="text-sm text-arena-wrong">
            {error}
          </p>
        ) : null}
      </form>
    </main>
  );
}
