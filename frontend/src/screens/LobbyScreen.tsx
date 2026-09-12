import { motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { fadeRise, liftOnHover, staggerContainer, staggerItem } from "../motion/presets";
import { useGameSession } from "../session/useGameSession";

const MAX_NAME_LENGTH = 20;
const ROOM_CODE_LENGTH = 6;

const FIELD_CLASS =
  "rounded-md border border-arena-border bg-arena-background/70 px-3 py-2 text-slate-100 outline-none transition-shadow focus:border-[color:rgb(var(--cat-accent-rgb))] focus:shadow-[0_0_0_3px_rgb(var(--cat-accent-rgb)/0.25)]";

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
      <motion.header
        className="text-center"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        <h1 className="cat-gradient-text text-6xl font-bold tracking-tight">Git Gud</h1>
        <p className="mt-3 text-slate-400">Real-time multiplayer developer trivia.</p>
      </motion.header>

      <motion.div
        className="cat-panel flex w-full max-w-sm flex-col gap-6 p-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.form
          className="flex flex-col gap-4"
          variants={staggerItem}
          onSubmit={handleCreate}
        >
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

          <motion.button
            type="submit"
            disabled={!nameReady}
            className="sheen cat-fill rounded-md px-4 py-2 font-semibold text-arena-background disabled:opacity-60"
            {...liftOnHover}
          >
            Create a room
          </motion.button>
        </motion.form>

        <motion.div
          className="flex items-center gap-3 text-xs uppercase tracking-widest text-slate-500"
          variants={staggerItem}
        >
          <span className="h-px flex-1 bg-arena-border" />
          or join
          <span className="h-px flex-1 bg-arena-border" />
        </motion.div>

        <motion.form className="flex flex-col gap-4" variants={staggerItem} onSubmit={handleJoin}>
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

          <motion.button
            type="submit"
            disabled={!nameReady || !codeReady}
            className="sheen cat-fill rounded-md px-4 py-2 font-semibold text-arena-background disabled:opacity-60"
            {...liftOnHover}
          >
            Join a room
          </motion.button>
        </motion.form>

        {error ? (
          <p role="alert" className="text-sm text-arena-wrong">
            {error}
          </p>
        ) : null}
      </motion.div>

      <motion.button
        type="button"
        onClick={() => navigate("/practice")}
        className="text-sm text-slate-400 underline"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        Practise on your own
      </motion.button>
    </main>
  );
}
