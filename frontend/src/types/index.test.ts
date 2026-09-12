import { describe, expect, expectTypeOf, it } from "vitest";

import {
  GAME_EVENT_TYPES,
  GAME_STATES,
  type CountdownTickPayload,
  type GameEvent,
  type PlayerAnsweredPayload,
  type QuestionStartPayload,
  type RoundResultDto,
} from "./index";

describe("shared types", () => {
  it("pins the game states to the backend enum", () => {
    expect([...GAME_STATES]).toEqual([
      "LOBBY",
      "COUNTDOWN",
      "QUESTION_ACTIVE",
      "ROUND_REVIEW",
      "GAME_OVER",
    ]);
  });

  it("pins the game event types to the backend enum", () => {
    expect([...GAME_EVENT_TYPES]).toEqual([
      "PLAYER_JOINED",
      "PLAYER_LEFT",
      "COUNTDOWN_TICK",
      "QUESTION_START",
      "PLAYER_ANSWERED",
      "ROUND_RESULT",
      "GAME_OVER",
    ]);
  });

  it("narrows the payload from the event type", () => {
    const event: GameEvent = { type: "COUNTDOWN_TICK", payload: { secondsRemaining: 3 } };

    if (event.type === "COUNTDOWN_TICK") {
      expectTypeOf(event.payload).toEqualTypeOf<CountdownTickPayload>();
      expect(event.payload.secondsRemaining).toBe(3);
    } else {
      throw new Error("expected a countdown event");
    }
  });

  it("carries the question window on a question start event", () => {
    const event: GameEvent = {
      type: "QUESTION_START",
      payload: {
        question: {
          id: 1,
          category: "Java & Spring Boot",
          text: "Which statement is true?",
          codeSnippet: null,
          options: ["A", "B", "C", "D"],
          deadlineEpochMs: 1_000_000,
        },
        questionNumber: 2,
        totalQuestions: 5,
      },
    };

    if (event.type === "QUESTION_START") {
      expectTypeOf(event.payload).toEqualTypeOf<QuestionStartPayload>();
      expect(event.payload.questionNumber).toBe(2);
      expect(event.payload.question.options).toHaveLength(4);
    } else {
      throw new Error("expected a question start event");
    }
  });

  it("reuses the round result and player answer payloads", () => {
    const roundResult: RoundResultDto = {
      correctOptionIndex: 2,
      explanation: "because",
      scoreboard: [{ name: "Alex", score: 1_250, streak: 1, answered: true }],
    };

    const answered: PlayerAnsweredPayload = {
      playerName: "Alex",
      answeredCount: 1,
      playerCount: 2,
    };

    expect(roundResult.scoreboard[0]?.answered).toBe(true);
    expect(answered.answeredCount).toBe(1);
  });
});
