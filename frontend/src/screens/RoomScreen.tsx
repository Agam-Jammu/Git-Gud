import { useParams } from "react-router-dom";

import { WaitingRoom } from "../components/WaitingRoom";
import { useGameSession } from "../session/useGameSession";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const { roomCode, players, connected, isHost, startMatch, leaveRoom } = useGameSession();

  if (!code || roomCode !== code) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Room</p>
        <h1 className="text-4xl font-bold tracking-[0.2em] text-arena-accent">{code}</h1>
        <p className="text-slate-400">Join this room from the lobby to take part.</p>
      </main>
    );
  }

  return (
    <WaitingRoom
      roomCode={code}
      players={players}
      connected={connected}
      isHost={isHost}
      onStart={startMatch}
      onLeave={() => {
        void leaveRoom();
      }}
    />
  );
}
