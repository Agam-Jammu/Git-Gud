import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { createRoom as createRoomRequest, fetchRoomStatus } from "../services/api";
import { createGameSocket, type GameSocket } from "../services/websocket";
import type { GameEvent, PlayerDto, RoomCreatedResponse, RoomStatusDto } from "../types";
import { GameSessionContext, type GameSession } from "./gameSessionContext";

export interface GameApi {
  createRoom: () => Promise<RoomCreatedResponse>;
  fetchRoomStatus: (code: string) => Promise<RoomStatusDto>;
}

export interface GameSessionProviderProps {
  children: ReactNode;
  api?: GameApi;
  socketFactory?: typeof createGameSocket;
}

interface SessionState {
  roomCode: string | null;
  playerName: string | null;
  connected: boolean;
  players: PlayerDto[];
  latestEvent: GameEvent | null;
  error: string | null;
}

const INITIAL_STATE: SessionState = {
  roomCode: null,
  playerName: null,
  connected: false,
  players: [],
  latestEvent: null,
  error: null,
};

const DEFAULT_API: GameApi = { createRoom: createRoomRequest, fetchRoomStatus };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "something went wrong";
}

function applyEvent(state: SessionState, event: GameEvent): SessionState {
  const next: SessionState = { ...state, latestEvent: event };

  switch (event.type) {
    case "PLAYER_JOINED":
    case "PLAYER_LEFT":
      return { ...next, players: event.payload.players };
    case "ROUND_RESULT":
      return { ...next, players: event.payload.scoreboard };
    case "GAME_OVER":
      return { ...next, players: event.payload.standings };
    default:
      return next;
  }
}

export function GameSessionProvider({
  children,
  api = DEFAULT_API,
  socketFactory = createGameSocket,
}: GameSessionProviderProps) {
  const socketRef = useRef<GameSocket | null>(null);
  const [state, setState] = useState<SessionState>(INITIAL_STATE);

  const handleEvent = useCallback((event: GameEvent) => {
    setState((current) => applyEvent(current, event));
  }, []);

  const connect = useCallback(
    (roomCode: string, playerName: string) => {
      const socket = socketFactory(roomCode, {
        onEvent: handleEvent,
        onConnected: () => {
          setState((current) => ({ ...current, connected: true }));
          socketRef.current?.join(playerName);
        },
        onDisconnected: () => setState((current) => ({ ...current, connected: false })),
        onError: (message) => setState((current) => ({ ...current, error: message })),
      });

      socketRef.current = socket;
      socket.connect();
    },
    [handleEvent, socketFactory],
  );

  const createRoom = useCallback(
    async (playerName: string) => {
      try {
        const room = await api.createRoom();
        setState((current) => ({ ...current, roomCode: room.code, playerName, error: null }));
        connect(room.code, playerName);
      } catch (error) {
        setState((current) => ({ ...current, error: errorMessage(error) }));
      }
    },
    [api, connect],
  );

  const joinRoom = useCallback(
    async (roomCode: string, playerName: string) => {
      try {
        await api.fetchRoomStatus(roomCode);
        setState((current) => ({ ...current, roomCode, playerName, error: null }));
        connect(roomCode, playerName);
      } catch (error) {
        setState((current) => ({ ...current, error: errorMessage(error) }));
      }
    },
    [api, connect],
  );

  const leaveRoom = useCallback(async () => {
    socketRef.current?.leave();
    await socketRef.current?.disconnect();
    socketRef.current = null;
    setState({ ...INITIAL_STATE });
  }, []);

  const startMatch = useCallback(() => {
    socketRef.current?.start();
  }, []);

  const submitAnswer = useCallback((questionId: number, selectedOptionIndex: number) => {
    socketRef.current?.answer({ questionId, selectedOptionIndex });
  }, []);

  useEffect(
    () => () => {
      void socketRef.current?.disconnect();
    },
    [],
  );

  const value = useMemo<GameSession>(
    () => ({ ...state, createRoom, joinRoom, leaveRoom, startMatch, submitAnswer }),
    [state, createRoom, joinRoom, leaveRoom, startMatch, submitAnswer],
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}
