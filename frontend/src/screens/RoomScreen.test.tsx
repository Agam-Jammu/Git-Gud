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
    phase: "lobby",
    players: [HOST],
    countdownSeconds: null,
    question: null,
    selectedOptionIndex: null,
    roundResult: null,
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
    expect(screen.getByRole("button", { name: "Join this room" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start match" })).not.toBeInTheDocument();
  });

  it("joins the room through the session", async () => {
    const user = userEvent.setup();
    const session = sessionWith({ roomCode: null, players: [] });
    renderRoom(session);

    await user.type(screen.getByLabelText("Your name"), "Casey");
    await user.click(screen.getByRole("button", { name: "Join this room" }));

    expect(session.joinRoom).toHaveBeenCalledWith("ABC123", "Casey");
  });

  it("shows the countdown while the match is about to start", () => {
    renderRoom(sessionWith({ phase: "countdown", countdownSeconds: 3 }));

    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows the current question during a round", () => {
    renderRoom(
      sessionWith({
        phase: "question",
        question: {
          question: {
            id: 7,
            category: "Java & Spring Boot",
            text: "Which of these Stream operations is terminal?",
            codeSnippet: null,
            options: ["map", "filter", "collect", "peek"],
            deadlineEpochMs: 1_000_000,
          },
          questionNumber: 1,
          totalQuestions: 5,
        },
      }),
    );

    expect(screen.getByText("Question 1 of 5")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Which of these Stream operations is terminal?" }),
    ).toBeInTheDocument();
  });

  it("shows the reveal with the answer and the scoreboard", () => {
    renderRoom(
      sessionWith({
        phase: "reveal",
        selectedOptionIndex: 2,
        question: {
          question: {
            id: 7,
            category: "Java & Spring Boot",
            text: "Which of these Stream operations is terminal?",
            codeSnippet: null,
            options: ["map", "filter", "collect", "peek"],
            deadlineEpochMs: 1_000_000,
          },
          questionNumber: 1,
          totalQuestions: 5,
        },
        roundResult: {
          correctOptionIndex: 2,
          explanation: "collect is terminal",
          scoreboard: [{ ...HOST, score: 1_250, answered: true }],
        },
      }),
    );

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("collect is terminal")).toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
  });

  it("tells the player when their answer was wrong", () => {
    renderRoom(
      sessionWith({
        phase: "reveal",
        selectedOptionIndex: 0,
        roundResult: { correctOptionIndex: 2, explanation: "because", scoreboard: [] },
      }),
    );

    expect(screen.getByText("Not quite")).toBeInTheDocument();
  });

  it("shows the final standings when the match ends", () => {
    renderRoom(
      sessionWith({
        phase: "gameOver",
        playerName: "Sam",
        players: [
          { ...HOST, score: 3_000, answered: true },
          { ...HOST, name: "Sam", score: 1_500, host: false, answered: true },
        ],
      }),
    );

    expect(screen.getByRole("heading", { name: "Alex wins" })).toBeInTheDocument();

    const rows = screen.getAllByRole("listitem");

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Alex");
    expect(rows[0]).toHaveTextContent("3,000");
    expect(rows[1]).toHaveTextContent("Sam");
    expect(rows[1]).toHaveTextContent("You");
    expect(screen.getByRole("button", { name: "Play again" })).toBeInTheDocument();
  });

  it("shows a join failure through the prompt", () => {
    renderRoom(sessionWith({ roomCode: null, players: [], error: "No room with code ABC123" }));

    expect(screen.getByRole("alert")).toHaveTextContent("No room with code ABC123");
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
