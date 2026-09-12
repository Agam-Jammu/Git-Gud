import { Client, type IMessage, type StompConfig } from "@stomp/stompjs";
import SockJS from "sockjs-client";

import type { GameEvent, JoinRoomRequest, SubmitAnswerRequest } from "../types";
import { API_BASE_URL } from "./api";

export interface GameSocketHandlers {
  onEvent: (event: GameEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (message: string) => void;
}

export interface GameSocket {
  connect: () => void;
  disconnect: () => Promise<void>;
  join: (playerName: string) => void;
  leave: () => void;
  start: () => void;
  answer: (request: SubmitAnswerRequest) => void;
  connected: () => boolean;
}

export interface GameSocketOptions {
  clientFactory?: (config: StompConfig) => Client;
}

export function createGameSocket(
  roomCode: string,
  handlers: GameSocketHandlers,
  options: GameSocketOptions = {},
): GameSocket {
  const createClient = options.clientFactory ?? ((config: StompConfig) => new Client(config));

  const client = createClient({
    webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
    reconnectDelay: 0,
    onConnect: () => {
      client.subscribe(`/topic/room/${roomCode}`, (message: IMessage) => {
        handlers.onEvent(JSON.parse(message.body) as GameEvent);
      });
      handlers.onConnected?.();
    },
    onDisconnect: () => handlers.onDisconnected?.(),
    onStompError: (frame) => handlers.onError?.(frame.headers["message"] ?? "stomp error"),
    onWebSocketError: () => handlers.onError?.("the connection to the server failed"),
  });

  const publish = (action: string, body?: unknown) => {
    if (!client.connected) {
      handlers.onError?.("the socket is not connected");
      return;
    }
    client.publish({
      destination: `/app/room/${roomCode}/${action}`,
      body: body === undefined ? "" : JSON.stringify(body),
    });
  };

  return {
    connect: () => client.activate(),
    disconnect: () => client.deactivate(),
    join: (playerName) => publish("join", { playerName } satisfies JoinRoomRequest),
    leave: () => publish("leave"),
    start: () => publish("start"),
    answer: (request) => publish("answer", request satisfies SubmitAnswerRequest),
    connected: () => client.connected,
  };
}
