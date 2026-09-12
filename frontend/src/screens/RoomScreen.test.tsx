import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { GameSessionContext, type GameSession } from "../session/gameSessionContext";
import type { PlayerDto } from "../types";
import { RoomScreen } from "./RoomScreen";

const HOST: PlayerDto = { name: "Alex", score: 0, streak: 0, answered: false, host: true };
const GUEST: PlayerDto = { name: "Sam", score: 0, streak: 0, answered: false, host: false };

function sessionWith(overrides: Partial<GameSession> = {}): GameSession {
  return {
    roomCode: "ABC123",
    playerName: "Alex",
    connected: true,
    isHost: true,
    players: [HOST],
    latestEvent: null,
    error: null,
    createRoom: vi.fn().mockResolvedValue(undefined),
    joinRoom: vi.fn().mockResolvedValue(undefined),
    leaveRoom: vi.fn().mockResolvedValue(undefined),
    startMatch: vi.fn(),
    submitAnswer: vi.fn(),
    ...overrides,
  };
}

function renderRoom(session: GameSession) {
  render(
    <GameSessionContext.Provider value={session}>
      <MemoryRouter initialEntries={["/room/ABC123"]}>
        <Routes>
          <Route path="/room/:code" element={<RoomScreen />} />
        </Routes>
      </MemoryRouter>
    </GameSessionContext.Provider>,
  );
}

describe("room screen", () => {
  it("invites a visitor with no session to join", () => {
    renderRoom(sessionWith({ roomCode: null, players: [] }));

    expect(screen.getByRole("heading", { name: "ABC123" })).toBeInTheDocument();
    expect(screen.getByText("Join this room from the lobby to take part.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start match" })).not.toBeInTheDocument();
  });

  it("shows the waiting room once the player is in the room", () => {
    renderRoom(sessionWith());

    expect(screen.getByText("Players (1)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start match" })).toBeInTheDocument();
  });

  it("shows the waiting room without start controls for a guest", () => {
    renderRoom(sessionWith({ playerName: "Sam", isHost: false, players: [HOST, GUEST] }));

    expect(screen.getByText("Players (2)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start match" })).not.toBeInTheDocument();
  });

  it("starts the match through the session", async () => {
    const user = userEvent.setup();
    const session = sessionWith();
    renderRoom(session);

    await user.click(screen.getByRole("button", { name: "Start match" }));

    expect(session.startMatch).toHaveBeenCalledOnce();
  });

  it("leaves the room through the session", async () => {
    const user = userEvent.setup();
    const session = sessionWith();
    renderRoom(session);

    await user.click(screen.getByRole("button", { name: "Leave room" }));

    expect(session.leaveRoom).toHaveBeenCalledOnce();
  });
});
