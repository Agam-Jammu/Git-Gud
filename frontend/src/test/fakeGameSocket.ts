import type { GameSocket, GameSocketHandlers } from "../services/websocket";
import type { GameEvent } from "../types";

export class FakeGameSocket implements GameSocket {
  joined: string[] = [];
  answers: Array<{ questionId: number; selectedOptionIndex: number }> = [];
  startCount = 0;
  leaveCount = 0;
  deactivated = false;
  open = false;

  constructor(private readonly handlers: GameSocketHandlers) {}

  connect() {
    this.open = true;
    this.handlers.onConnected?.();
  }

  async disconnect() {
    this.deactivated = true;
    this.open = false;
  }

  join(playerName: string) {
    this.joined.push(playerName);
  }

  leave() {
    this.leaveCount += 1;
  }

  start() {
    this.startCount += 1;
  }

  answer(request: { questionId: number; selectedOptionIndex: number }) {
    this.answers.push(request);
  }

  connected() {
    return this.open;
  }

  emit(event: GameEvent) {
    this.handlers.onEvent(event);
  }
}

export function createFakeSocketFactory(sockets: FakeGameSocket[]) {
  return (_roomCode: string, handlers: GameSocketHandlers): GameSocket => {
    const socket = new FakeGameSocket(handlers);
    sockets.push(socket);
    return socket;
  };
}
