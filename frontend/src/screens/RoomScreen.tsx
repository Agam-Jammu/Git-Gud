import { useParams } from "react-router-dom";

import { JoinRoomPrompt } from "../components/JoinRoomPrompt";
import { WaitingRoom } from "../components/WaitingRoom";
import { useGameSession } from "../session/useGameSession";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const { roomCode, players, connected, isHost, error, startMatch, leaveRoom, joinRoom } =
    useGameSession();

  if (!code || roomCode !== code) {
    return (
      <JoinRoomPrompt
        roomCode={code ?? ""}
        error={error}
        onJoin={(playerName) => joinRoom(code ?? "", playerName)}
      />
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
