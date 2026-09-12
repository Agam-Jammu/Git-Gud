import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppRoutes } from "./App";
import { GameSessionProvider, type GameApi } from "./session/GameSessionProvider";
import { createFakeSocketFactory, type FakeGameSocket } from "./test/fakeGameSocket";

const fakeApi: GameApi = {
  createRoom: async () => ({ code: "ABC123" }),
  fetchRoomStatus: async () => ({ code: "ABC123", state: "LOBBY", players: [] }),
};

function renderAt(path: string) {
  const sockets: FakeGameSocket[] = [];

  return render(
    <GameSessionProvider api={fakeApi} socketFactory={createFakeSocketFactory(sockets)}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </GameSessionProvider>,
  );
}

describe("app routes", () => {
  it("shows the lobby at the root", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { name: "Git Gud" })).toBeInTheDocument();
  });

  it("shows the room code on a room route", () => {
    renderAt("/room/ABC123");

    expect(screen.getByRole("heading", { name: "ABC123" })).toBeInTheDocument();
  });

  it("redirects unknown routes to the lobby", () => {
    renderAt("/does-not-exist");

    expect(screen.getByRole("heading", { name: "Git Gud" })).toBeInTheDocument();
  });
});
