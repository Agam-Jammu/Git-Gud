import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { GameSessionContext, type GameSession } from "../session/gameSessionContext";
import type { QuestionStartPayload } from "../types";
import { ArenaBackdropLayer } from "./ArenaBackdropLayer";

const GIT_QUESTION: QuestionStartPayload = {
  question: {
    id: 1,
    category: "Git & Linux",
    text: "Which command lists stashes?",
    codeSnippet: null,
    options: ["git stash list"],
    deadlineEpochMs: 0,
  },
  questionNumber: 1,
  totalQuestions: 5,
};

function sessionWith(question: QuestionStartPayload | null): GameSession {
  return {
    roomCode: "ABC123",
    playerName: "Alex",
    connected: true,
    isHost: true,
    phase: question ? "question" : "lobby",
    players: [],
    countdownSeconds: null,
    question,
    selectedOptionIndex: null,
    roundResult: null,
    latestEvent: null,
    error: null,
    createRoom: vi.fn().mockResolvedValue(undefined),
    joinRoom: vi.fn().mockResolvedValue(undefined),
    leaveRoom: vi.fn().mockResolvedValue(undefined),
    startMatch: vi.fn(),
    submitAnswer: vi.fn(),
  };
}

function renderLayer(session: GameSession) {
  render(
    <GameSessionContext.Provider value={session}>
      <ArenaBackdropLayer />
    </GameSessionContext.Provider>,
  );
}

function backdropStyle() {
  return screen.getByTestId("arena-backdrop").getAttribute("style") ?? "";
}

describe("ArenaBackdropLayer", () => {
  it("adopts the accent of the question in play", () => {
    renderLayer(sessionWith(GIT_QUESTION));

    expect(backdropStyle()).toContain("52 211 153");
  });

  it("keeps the default accent when no question is in play", () => {
    renderLayer(sessionWith(null));

    expect(backdropStyle()).toContain("91 140 255");
  });
});
