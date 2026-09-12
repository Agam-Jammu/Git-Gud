import { createContext } from "react";

import type { GameEvent, PlayerDto, QuestionStartPayload, RoundResultDto } from "../types";

export type GamePhase = "lobby" | "countdown" | "question" | "reveal" | "gameOver";

export interface GameSession {
  roomCode: string | null;
  playerName: string | null;
  connected: boolean;
  isHost: boolean;
  phase: GamePhase;
  players: PlayerDto[];
  countdownSeconds: number | null;
  question: QuestionStartPayload | null;
  roundResult: RoundResultDto | null;
  latestEvent: GameEvent | null;
  error: string | null;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startMatch: () => void;
  submitAnswer: (questionId: number, selectedOptionIndex: number) => void;
}

export const GameSessionContext = createContext<GameSession | null>(null);
