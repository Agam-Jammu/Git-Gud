import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createFakeSocketFactory, type FakeGameSocket } from "../test/fakeGameSocket";
import type { PlayerDto } from "../types";
import { GameSessionProvider, type GameApi } from "./GameSessionProvider";
import { useGameSession } from "./useGameSession";

const ALEX: PlayerDto = { name: "Alex", score: 0, streak: 0, answered: false, host: true };
const SAM: PlayerDto = { name: "Sam", score: 0, streak: 0, answered: false, host: false };

function setUp(api: GameApi) {
  const sockets: FakeGameSocket[] = [];

  const wrapper = ({ children }: { children: ReactNode }) => (
    <GameSessionProvider api={api} socketFactory={createFakeSocketFactory(sockets)}>
      {children}
    </GameSessionProvider>
  );

  const view = renderHook(() => useGameSession(), { wrapper });

  return { ...view, sockets };
}

function apiWith(overrides: Partial<GameApi> = {}): GameApi {
  return {
    createRoom: vi.fn().mockResolvedValue({ code: "ABC123" }),
    fetchRoomStatus: vi.fn().mockResolvedValue({ code: "ABC123", state: "LOBBY", players: [] }),
    ...overrides,
  };
}

describe("game session", () => {
  it("creates a room, connects and joins it", async () => {
    const { result, sockets } = setUp(apiWith());

    await act(async () => {
      await result.current.createRoom("Alex");
    });

    expect(result.current.roomCode).toBe("ABC123");
    expect(result.current.playerName).toBe("Alex");
    expect(result.current.connected).toBe(true);
    expect(sockets).toHaveLength(1);
    expect(sockets[0]?.joined).toEqual(["Alex"]);
  });

  it("validates the room before joining it", async () => {
    const api = apiWith();
    const { result, sockets } = setUp(api);

    await act(async () => {
      await result.current.joinRoom("XYZ789", "Sam");
    });

    expect(api.fetchRoomStatus).toHaveBeenCalledWith("XYZ789");
    expect(result.current.roomCode).toBe("XYZ789");
    expect(sockets[0]?.joined).toEqual(["Sam"]);
  });

  it("surfaces an api failure without opening a socket", async () => {
    const api = apiWith({
      fetchRoomStatus: vi.fn().mockRejectedValue(new Error("No room with code ZZZZZZ")),
    });
    const { result, sockets } = setUp(api);

    await act(async () => {
      await result.current.joinRoom("ZZZZZZ", "Sam");
    });

    expect(result.current.error).toBe("No room with code ZZZZZZ");
    expect(result.current.roomCode).toBeNull();
    expect(sockets).toHaveLength(0);
  });

  it("tracks the roster from join and leave events", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    act(() => {
      sockets[0]?.emit({ type: "PLAYER_JOINED", payload: { playerName: "Alex", players: [ALEX] } });
    });
    expect(result.current.players).toEqual([ALEX]);

    act(() => {
      sockets[0]?.emit({ type: "PLAYER_LEFT", payload: { playerName: "Sam", players: [ALEX, SAM] } });
    });
    expect(result.current.players).toEqual([ALEX, SAM]);
  });

  it("reports the local player as host when the roster flags them", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    act(() => {
      sockets[0]?.emit({ type: "PLAYER_JOINED", payload: { playerName: "Alex", players: [ALEX] } });
    });

    expect(result.current.isHost).toBe(true);
  });

  it("does not report a guest as host", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Sam");
    });

    act(() => {
      sockets[0]?.emit({ type: "PLAYER_JOINED", payload: { playerName: "Sam", players: [ALEX, SAM] } });
    });

    expect(result.current.isHost).toBe(false);
  });

  it("adopts the scoreboard from a round result", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    const scored = { ...ALEX, score: 1_250, streak: 1, answered: true };

    act(() => {
      sockets[0]?.emit({
        type: "ROUND_RESULT",
        payload: { correctOptionIndex: 2, explanation: "because", scoreboard: [scored] },
      });
    });

    expect(result.current.players).toEqual([scored]);
    expect(result.current.latestEvent?.type).toBe("ROUND_RESULT");
  });

  it("adopts the standings when the game ends", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    act(() => {
      sockets[0]?.emit({ type: "GAME_OVER", payload: { standings: [ALEX, SAM] } });
    });

    expect(result.current.players).toEqual([ALEX, SAM]);
  });

  it("delegates starting the match and answering to the socket", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    act(() => {
      result.current.startMatch();
      result.current.submitAnswer(7, 2);
    });

    expect(sockets[0]?.startCount).toBe(1);
    expect(sockets[0]?.answers).toEqual([{ questionId: 7, selectedOptionIndex: 2 }]);
  });

  it("leaves the room, resets state and disconnects", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    await act(async () => {
      await result.current.leaveRoom();
    });

    expect(sockets[0]?.leaveCount).toBe(1);
    expect(sockets[0]?.deactivated).toBe(true);
    expect(result.current.roomCode).toBeNull();
    expect(result.current.connected).toBe(false);
    expect(result.current.players).toEqual([]);
  });

  it("reports socket errors", async () => {
    const { result, sockets } = setUp(apiWith());
    await act(async () => {
      await result.current.createRoom("Alex");
    });

    act(() => {
      sockets[0]?.emit({ type: "COUNTDOWN_TICK", payload: { secondsRemaining: 3 } });
    });

    expect(result.current.latestEvent).toEqual({ type: "COUNTDOWN_TICK", payload: { secondsRemaining: 3 } });
  });

  it("throws when used outside the provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderHook(() => useGameSession())).toThrowError(
      "useGameSession must be used inside a GameSessionProvider",
    );

    consoleError.mockRestore();
  });
});
