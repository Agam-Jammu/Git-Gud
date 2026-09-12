import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PlayerDto } from "../types";
import { WaitingRoom, type WaitingRoomProps } from "./WaitingRoom";

const HOST: PlayerDto = { name: "Alex", score: 0, streak: 0, answered: false, host: true };
const GUEST: PlayerDto = { name: "Sam", score: 0, streak: 0, answered: false, host: false };

function renderRoom(overrides: Partial<WaitingRoomProps> = {}) {
  const props: WaitingRoomProps = {
    roomCode: "ABC123",
    players: [HOST, GUEST],
    connected: true,
    isHost: true,
    onStart: vi.fn(),
    onLeave: vi.fn(),
    ...overrides,
  };

  render(<WaitingRoom {...props} />);

  return props;
}

describe("waiting room", () => {
  it("shows the room code and a shareable link", () => {
    renderRoom();

    expect(screen.getByRole("heading", { name: "ABC123" })).toBeInTheDocument();
    expect(screen.getByLabelText("Share link")).toHaveValue("http://localhost:3000/room/ABC123");
  });

  it("lists every player and marks the host", () => {
    renderRoom();

    expect(screen.getByText("Players (2)")).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Sam")).toBeInTheDocument();
    expect(screen.getByText("Host")).toBeInTheDocument();
  });

  it("copies the share link to the clipboard", async () => {
    const user = userEvent.setup();
    renderRoom();

    await user.click(screen.getByRole("button", { name: "Copy link" }));

    await expect(navigator.clipboard.readText()).resolves.toBe("http://localhost:3000/room/ABC123");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("lets the host start the match", async () => {
    const user = userEvent.setup();
    const props = renderRoom();

    await user.click(screen.getByRole("button", { name: "Start match" }));

    expect(props.onStart).toHaveBeenCalledOnce();
  });

  it("hides the start button from guests", () => {
    renderRoom({ isHost: false });

    expect(screen.queryByRole("button", { name: "Start match" })).not.toBeInTheDocument();
    expect(screen.getByText("Waiting for the host to start the match")).toBeInTheDocument();
  });

  it("blocks starting until the socket connects", () => {
    renderRoom({ connected: false });

    expect(screen.getByRole("button", { name: "Start match" })).toBeDisabled();
    expect(screen.getByText("Connecting to the room...")).toBeInTheDocument();
  });

  it("leaves the room", async () => {
    const user = userEvent.setup();
    const props = renderRoom();

    await user.click(screen.getByRole("button", { name: "Leave room" }));

    expect(props.onLeave).toHaveBeenCalledOnce();
  });
});
