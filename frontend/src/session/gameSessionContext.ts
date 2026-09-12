import { createContext } from "react";

import type { GameEvent, PlayerDto } from "../types";

export interface GameSession {
  roomCode: string | null;
  playerName: string | null;
  connected: boolean;
  isHost: boolean;
  players: PlayerDto[];
  latestEvent: GameEvent | null;
  error: string | null;
  createRoom: (playerName: string) => Promise<void>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startMatch: () => void;
  submitAnswer: (questionId: number, selectedOptionIndex: number) => void;
}

export const GameSessionContext = createContext<GameSession | null>(null);
