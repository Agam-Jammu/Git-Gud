import { useParams } from "react-router-dom";

import { Countdown } from "../components/Countdown";
import { JoinRoomPrompt } from "../components/JoinRoomPrompt";
import { QuestionCard } from "../components/QuestionCard";
import { WaitingRoom } from "../components/WaitingRoom";
import { useGameSession } from "../session/useGameSession";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const session = useGameSession();
  const { roomCode, phase, countdownSeconds, question, players, connected, isHost, error } = session;

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
      <QuestionCard
        question={question.question}
        questionNumber={question.questionNumber}
        totalQuestions={question.totalQuestions}
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
