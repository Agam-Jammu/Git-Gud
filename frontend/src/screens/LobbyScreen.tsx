import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useGameSession } from "../session/useGameSession";

const MAX_NAME_LENGTH = 20;
const ROOM_CODE_LENGTH = 6;

const FIELD_CLASS =
  "rounded-md border border-arena-border bg-arena-background px-3 py-2 text-slate-100 outline-none focus:border-arena-accent";

export function LobbyScreen() {
  const { createRoom, joinRoom, error, roomCode } = useGameSession();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
  }, [navigate, roomCode]);

  const nameReady = playerName.trim().length > 0 && !busy;
  const codeReady = code.trim().length === ROOM_CODE_LENGTH;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(() => createRoom(playerName.trim()));
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(() => joinRoom(code.trim(), playerName.trim()));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-arena-accent">Git Gud</h1>
        <p className="mt-2 text-slate-400">Real-time multiplayer developer trivia.</p>
      </header>

      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-arena-border bg-arena-surface p-6">
        <form className="flex flex-col gap-4" onSubmit={handleCreate}>
          <label className="flex flex-col gap-2 text-sm text-slate-300" htmlFor="player-name">
            Your name
            <input
              id="player-name"
              className={FIELD_CLASS}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              maxLength={MAX_NAME_LENGTH}
              autoComplete="off"
            />
          </label>

          <button
            type="submit"
            disabled={!nameReady}
            className="rounded-md bg-arena-accent px-4 py-2 font-semibold text-arena-background disabled:opacity-40"
          >
            Create a room
          </button>
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500">
          <span className="h-px flex-1 bg-arena-border" />
          or join
          <span className="h-px flex-1 bg-arena-border" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleJoin}>
          <label className="flex flex-col gap-2 text-sm text-slate-300" htmlFor="room-code">
            Room code
            <input
              id="room-code"
              className={`${FIELD_CLASS} uppercase tracking-[0.3em]`}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              maxLength={ROOM_CODE_LENGTH}
              autoComplete="off"
            />
          </label>

          <button
            type="submit"
            disabled={!nameReady || !codeReady}
            className="rounded-md border border-arena-accent px-4 py-2 font-semibold text-arena-accent disabled:opacity-40"
          >
            Join a room
          </button>
        </form>

        {error ? (
          <p role="alert" className="text-sm text-arena-wrong">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}
