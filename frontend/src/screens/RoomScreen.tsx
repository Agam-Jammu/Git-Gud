import { useParams } from "react-router-dom";

import { Countdown } from "../components/Countdown";
import { JoinRoomPrompt } from "../components/JoinRoomPrompt";
import { WaitingRoom } from "../components/WaitingRoom";
import { useCountdown } from "../hooks/useCountdown";
import { useGameSession } from "../session/useGameSession";
import { Arena } from "./Arena";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const session = useGameSession();
  const {
    roomCode,
    phase,
    countdownSeconds,
    question,
    selectedOptionIndex,
    players,
    connected,
    isHost,
    error,
  } = session;

  const secondsRemaining = useCountdown(question?.question.deadlineEpochMs ?? 0);

  if (!code || roomCode !== code) {
    return (
      <JoinRoomPrompt
        roomCode={code ?? ""}
        error={error}
        onJoin={(playerName) => session.joinRoom(code ?? "", playerName)}
      />
    );
  }

  if (phase === "countdown" && countdownSeconds !== null) {
    return <Countdown secondsRemaining={countdownSeconds} />;
  }

  if (phase === "question" && question) {
    return (
      <Arena
        question={question}
        secondsRemaining={secondsRemaining}
        selectedOptionIndex={selectedOptionIndex}
        onSelect={(optionIndex) => session.submitAnswer(question.question.id, optionIndex)}
      />
    );
  }

  if (phase === "reveal" || phase === "gameOver") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 p-8">
        <h1 className="text-3xl font-semibold text-arena-accent">
          {phase === "gameOver" ? "Game over" : "Round over"}
        </h1>
      </main>
    );
  }

  return (
    <WaitingRoom
      roomCode={code}
      players={players}
      connected={connected}
      isHost={isHost}
      onStart={session.startMatch}
      onLeave={() => {
        void session.leaveRoom();
      }}
    />
  );
}
