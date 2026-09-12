export const GAME_STATES = [
  "LOBBY",
  "COUNTDOWN",
  "QUESTION_ACTIVE",
  "ROUND_REVIEW",
  "GAME_OVER",
] as const;

export type GameState = (typeof GAME_STATES)[number];

export const GAME_EVENT_TYPES = [
  "PLAYER_JOINED",
  "PLAYER_LEFT",
  "COUNTDOWN_TICK",
  "QUESTION_START",
  "PLAYER_ANSWERED",
  "ROUND_RESULT",
  "GAME_OVER",
] as const;

export type GameEventType = (typeof GAME_EVENT_TYPES)[number];

export interface PlayerDto {
  name: string;
  score: number;
  streak: number;
  answered: boolean;
  host: boolean;
}

export interface QuestionDto {
  id: number;
  category: string;
  text: string;
  codeSnippet: string | null;
  options: string[];
  deadlineEpochMs: number;
}

export interface RoundResultDto {
  correctOptionIndex: number;
  explanation: string;
  scoreboard: PlayerDto[];
}

export interface CategoryDto {
  name: string;
  questionCount: number;
}

export interface PracticeQuestionDto {
  id: number;
  category: string;
  text: string;
  codeSnippet: string | null;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface RoomCreatedResponse {
  code: string;
}

export interface RoomStatusDto {
  code: string;
  state: GameState;
  players: PlayerDto[];
}

export interface JoinRoomRequest {
  playerName: string;
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedOptionIndex: number;
}

export interface PlayerJoinedPayload {
  playerName: string;
  players: PlayerDto[];
}

export interface PlayerLeftPayload {
  playerName: string | null;
  players: PlayerDto[];
}

export interface PlayerAnsweredPayload {
  playerName: string;
  answeredCount: number;
  playerCount: number;
}

export interface CountdownTickPayload {
  secondsRemaining: number;
}

export interface QuestionStartPayload {
  question: QuestionDto;
  questionNumber: number;
  totalQuestions: number;
}

export interface GameOverPayload {
  standings: PlayerDto[];
}

export interface EventPayloads {
  PLAYER_JOINED: PlayerJoinedPayload;
  PLAYER_LEFT: PlayerLeftPayload;
  COUNTDOWN_TICK: CountdownTickPayload;
  QUESTION_START: QuestionStartPayload;
  PLAYER_ANSWERED: PlayerAnsweredPayload;
  ROUND_RESULT: RoundResultDto;
  GAME_OVER: GameOverPayload;
}

export type GameEvent = {
  [Type in GameEventType]: { type: Type; payload: EventPayloads[Type] };
}[GameEventType];
