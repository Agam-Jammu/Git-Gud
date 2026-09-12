import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { PlayerDto } from "../types";
import { Podium, ordinal, type PodiumProps } from "./Podium";

const ALEX: PlayerDto = { name: "Alex", score: 3_000, streak: 3, answered: true, host: true };
const SAM: PlayerDto = { name: "Sam", score: 1_500, streak: 1, answered: true, host: false };
const CASEY: PlayerDto = { name: "Casey", score: 500, streak: 0, answered: true, host: false };

function renderPodium(overrides: Partial<PodiumProps> = {}) {
  const props: PodiumProps = {
    standings: [ALEX, SAM, CASEY],
    playerName: "Sam",
    isHost: true,
    onPlayAgain: vi.fn(),
    onLeave: vi.fn(),
    ...overrides,
  };

  render(<Podium {...props} />);

  return props;
}

function standingRows() {
  return within(screen.getByLabelText("Final standings")).queryAllByRole("listitem");
}

describe("ordinal", () => {
  it("uses the expected suffix for each position", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(4)).toBe("4th");
  });

  it("handles the teens that break the pattern", () => {
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(12)).toBe("12th");
    expect(ordinal(13)).toBe("13th");
    expect(ordinal(21)).toBe("21st");
    expect(ordinal(22)).toBe("22nd");
  });
});

describe("podium", () => {
  it("announces the winner", () => {
    renderPodium();

    expect(screen.getByRole("heading", { name: "Alex wins" })).toBeInTheDocument();
  });

  it("lists the standings in order with positions and scores", () => {
    renderPodium();

    const rows = standingRows();

    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("1st");
    expect(rows[0]).toHaveTextContent("Alex");
    expect(rows[0]).toHaveTextContent("3,000");
    expect(rows[1]).toHaveTextContent("Sam");
    expect(rows[2]).toHaveTextContent("3rd");
    expect(rows[2]).toHaveTextContent("Casey");
  });

  it("marks which row is the local player", () => {
    renderPodium();

    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("copes with an empty match", () => {
    renderPodium({ standings: [] });

    expect(screen.getByRole("heading", { name: "No players" })).toBeInTheDocument();
    expect(standingRows()).toHaveLength(0);
  });

  it("lets the host start a rematch", async () => {
    const user = userEvent.setup();
    const props = renderPodium();

    await user.click(screen.getByRole("button", { name: "Play again" }));

    expect(props.onPlayAgain).toHaveBeenCalledOnce();
  });

  it("tells a guest to wait for the host", () => {
    renderPodium({ isHost: false });

    expect(screen.queryByRole("button", { name: "Play again" })).not.toBeInTheDocument();
    expect(screen.getByText("Waiting for the host to start a rematch")).toBeInTheDocument();
  });

  it("leaves the room", async () => {
    const user = userEvent.setup();
    const props = renderPodium();

    await user.click(screen.getByRole("button", { name: "Leave room" }));

    expect(props.onLeave).toHaveBeenCalledOnce();
  });
});
