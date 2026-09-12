import { useNavigate, useParams } from "react-router-dom";

import { Countdown } from "../components/Countdown";
import { JoinRoomPrompt } from "../components/JoinRoomPrompt";
import { Podium } from "../components/Podium";
import { RoundReveal } from "../components/RoundReveal";
import { WaitingRoom } from "../components/WaitingRoom";
import { useCountdown } from "../hooks/useCountdown";
import { useGameSession } from "../session/useGameSession";
import { Arena } from "./Arena";

export function RoomScreen() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const session = useGameSession();
  const {
    roomCode,
    playerName,
    phase,
    countdownSeconds,
    question,
    selectedOptionIndex,
    roundResult,
    players,
    connected,
    isHost,
    error,
  } = session;

  const secondsRemaining = useCountdown(question?.question.deadlineEpochMs ?? 0);

  async function handleLeave() {
    await session.leaveRoom();
    navigate("/");
  }

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

  if (phase === "reveal" && roundResult) {
    return (
      <RoundReveal
        question={question?.question ?? null}
        correctOptionIndex={roundResult.correctOptionIndex}
        explanation={roundResult.explanation}
        scoreboard={roundResult.scoreboard}
        selectedOptionIndex={selectedOptionIndex}
      />
    );
  }

  if (phase === "gameOver") {
    return (
      <Podium
        standings={players}
        playerName={playerName}
        isHost={isHost}
        onPlayAgain={session.startMatch}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <WaitingRoom
      roomCode={code}
      players={players}
      connected={connected}
      isHost={isHost}
      error={error}
      onStart={session.startMatch}
      onLeave={handleLeave}
    />
  );
}
