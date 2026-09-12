import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JoinRoomPrompt, type JoinRoomPromptProps } from "./JoinRoomPrompt";

function renderPrompt(overrides: Partial<JoinRoomPromptProps> = {}) {
  const props: JoinRoomPromptProps = {
    roomCode: "ABC123",
    error: null,
    onJoin: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };

  render(<JoinRoomPrompt {...props} />);

  return props;
}

describe("join room prompt", () => {
  it("names the room the visitor was invited to", () => {
    renderPrompt();

    expect(screen.getByRole("heading", { name: "ABC123" })).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toBeInTheDocument();
  });

  it("requires a name before joining", async () => {
    renderPrompt();

    const join = screen.getByRole("button", { name: "Join this room" });
    expect(join).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Your name"), "Casey");

    expect(join).toBeEnabled();
  });

  it("joins with a trimmed name", async () => {
    const props = renderPrompt();

    await userEvent.type(screen.getByLabelText("Your name"), "  Casey  ");
    await userEvent.click(screen.getByRole("button", { name: "Join this room" }));

    expect(props.onJoin).toHaveBeenCalledWith("Casey");
  });

  it("shows a failure reported by the session", () => {
    renderPrompt({ error: "No room with code ABC123" });

    expect(screen.getByRole("alert")).toHaveTextContent("No room with code ABC123");
  });
});
