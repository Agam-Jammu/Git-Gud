import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { AppRoutes } from "../App";
import { GameSessionProvider, type GameApi } from "../session/GameSessionProvider";
import { createFakeSocketFactory, type FakeGameSocket } from "../test/fakeGameSocket";

function apiWith(overrides: Partial<GameApi> = {}): GameApi {
  return {
    createRoom: vi.fn().mockResolvedValue({ code: "ABC123" }),
    fetchRoomStatus: vi.fn().mockResolvedValue({ code: "ABC123", state: "LOBBY", players: [] }),
    ...overrides,
  };
}

function renderLobby(api: GameApi) {
  const sockets: FakeGameSocket[] = [];

  render(
    <GameSessionProvider api={api} socketFactory={createFakeSocketFactory(sockets)}>
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>
    </GameSessionProvider>,
  );

  return sockets;
}

describe("lobby screen", () => {
  it("offers a name field and both entry points", () => {
    renderLobby(apiWith());

    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
    expect(screen.getByLabelText("Room code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create a room" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join a room" })).toBeInTheDocument();
  });

  it("creates a room and moves into it", async () => {
    const api = apiWith();
    const sockets = renderLobby(api);

    await userEvent.type(screen.getByLabelText("Your name"), "Alex");
    await userEvent.click(screen.getByRole("button", { name: "Create a room" }));

    expect(api.createRoom).toHaveBeenCalledOnce();
    expect(sockets[0]?.joined).toEqual(["Alex"]);
    expect(await screen.findByRole("heading", { name: "ABC123" })).toBeInTheDocument();
  });

  it("joins a room by code, normalising the case", async () => {
    const api = apiWith();
    const sockets = renderLobby(api);

    await userEvent.type(screen.getByLabelText("Your name"), "Sam");
    await userEvent.type(screen.getByLabelText("Room code"), "xyz789");
    await userEvent.click(screen.getByRole("button", { name: "Join a room" }));

    expect(api.fetchRoomStatus).toHaveBeenCalledWith("XYZ789");
    expect(sockets[0]?.joined).toEqual(["Sam"]);
  });

  it("shows the problem detail and stays put when the room is unknown", async () => {
    const api = apiWith({
      fetchRoomStatus: vi.fn().mockRejectedValue(new Error("No room with code ZZZZZZ")),
    });
    renderLobby(api);

    await userEvent.type(screen.getByLabelText("Your name"), "Sam");
    await userEvent.type(screen.getByLabelText("Room code"), "ZZZZZZ");
    await userEvent.click(screen.getByRole("button", { name: "Join a room" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No room with code ZZZZZZ");
    expect(screen.queryByRole("heading", { name: "ZZZZZZ" })).not.toBeInTheDocument();
  });

  it("requires a name before creating", async () => {
    renderLobby(apiWith());

    const create = screen.getByRole("button", { name: "Create a room" });
    expect(create).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Your name"), "Alex");

    expect(create).toBeEnabled();
  });

  it("requires a full room code before joining", async () => {
    renderLobby(apiWith());

    await userEvent.type(screen.getByLabelText("Your name"), "Alex");
    const join = screen.getByRole("button", { name: "Join a room" });
    expect(join).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Room code"), "ABC");

    expect(join).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Room code"), "123");

    expect(join).toBeEnabled();
  });
});
