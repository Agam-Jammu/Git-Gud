import { describe, expect, it, vi } from "vitest";

import type { Client } from "@stomp/stompjs";

import type { GameEvent } from "../types";
import { createGameSocket, type GameSocketHandlers } from "./websocket";

interface FakeConfig {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onStompError?: (frame: { headers: Record<string, string> }) => void;
  onWebSocketError?: () => void;
}

class FakeClient {
  connected = false;
  activated = false;
  deactivated = false;
  config: FakeConfig = {};
  subscriptions: string[] = [];
  published: Array<{ destination: string; body: string }> = [];

  private subscriber?: (message: { body: string }) => void;

  activate() {
    this.activated = true;
  }

  async deactivate() {
    this.deactivated = true;
  }

  subscribe(destination: string, callback: (message: { body: string }) => void) {
    this.subscriptions.push(destination);
    this.subscriber = callback;
    return { unsubscribe: () => undefined };
  }

  publish(params: { destination: string; body: string }) {
    this.published.push(params);
  }

  emit(event: GameEvent) {
    this.subscriber?.({ body: JSON.stringify(event) });
  }
}

function setUp(handlers: Partial<GameSocketHandlers> = {}) {
  const fake = new FakeClient();
  const onEvent = handlers.onEvent ?? vi.fn();

  const socket = createGameSocket(
    "ABC123",
    { ...handlers, onEvent },
    {
      clientFactory: (config) => {
        fake.config = config as unknown as FakeConfig;
        return fake as unknown as Client;
      },
    },
  );

  return { fake, socket, onEvent };
}

describe("game socket", () => {
  it("activates the client when connecting", () => {
    const { fake, socket } = setUp();

    socket.connect();

    expect(fake.activated).toBe(true);
  });

  it("subscribes to the room topic once connected", () => {
    const onConnected = vi.fn();
    const { fake, socket } = setUp({ onConnected });

    socket.connect();
    fake.config.onConnect?.();

    expect(fake.subscriptions).toEqual(["/topic/room/ABC123"]);
    expect(onConnected).toHaveBeenCalledOnce();
  });

  it("forwards parsed events to the handler", () => {
    const { fake, socket, onEvent } = setUp();

    socket.connect();
    fake.config.onConnect?.();
    fake.emit({ type: "COUNTDOWN_TICK", payload: { secondsRemaining: 2 } });

    expect(onEvent).toHaveBeenCalledWith({
      type: "COUNTDOWN_TICK",
      payload: { secondsRemaining: 2 },
    });
  });

  it("publishes join, answer, start and leave to the room destinations", () => {
    const { fake, socket } = setUp();
    fake.connected = true;

    socket.join("Alex");
    socket.answer({ questionId: 7, selectedOptionIndex: 2 });
    socket.start();
    socket.leave();

    expect(fake.published).toEqual([
      { destination: "/app/room/ABC123/join", body: JSON.stringify({ playerName: "Alex" }) },
      {
        destination: "/app/room/ABC123/answer",
        body: JSON.stringify({ questionId: 7, selectedOptionIndex: 2 }),
      },
      { destination: "/app/room/ABC123/start", body: "" },
      { destination: "/app/room/ABC123/leave", body: "" },
    ]);
  });

  it("reports an error instead of publishing while disconnected", () => {
    const onError = vi.fn();
    const { fake, socket } = setUp({ onError });

    socket.join("Alex");

    expect(onError).toHaveBeenCalledWith("the socket is not connected");
    expect(fake.published).toEqual([]);
  });

  it("reports transport and broker failures", () => {
    const onError = vi.fn();
    const { fake } = setUp({ onError });

    fake.config.onWebSocketError?.();
    fake.config.onStompError?.({ headers: { message: "broker down" } });

    expect(onError).toHaveBeenNthCalledWith(1, "the connection to the server failed");
    expect(onError).toHaveBeenNthCalledWith(2, "broker down");
  });

  it("deactivates the client when disconnecting", async () => {
    const { fake, socket } = setUp();

    await socket.disconnect();

    expect(fake.deactivated).toBe(true);
  });

  it("reports the underlying connection state", () => {
    const { fake, socket } = setUp();

    expect(socket.connected()).toBe(false);

    fake.connected = true;

    expect(socket.connected()).toBe(true);
  });
});
