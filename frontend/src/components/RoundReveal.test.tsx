import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PlayerDto, QuestionDto } from "../types";
import { RoundReveal, type RoundRevealProps } from "./RoundReveal";

const QUESTION: QuestionDto = {
  id: 7,
  category: "Java & Spring Boot",
  text: "Which of these Stream operations is terminal?",
  codeSnippet: null,
  options: ["map", "filter", "collect", "peek"],
  deadlineEpochMs: 1_000_000,
};

const ALEX: PlayerDto = { name: "Alex", score: 1_250, streak: 2, answered: true, host: true };
const SAM: PlayerDto = { name: "Sam", score: 0, streak: 0, answered: true, host: false };

function renderReveal(overrides: Partial<RoundRevealProps> = {}) {
  const props: RoundRevealProps = {
    question: QUESTION,
    correctOptionIndex: 2,
    explanation: "collect is terminal",
    scoreboard: [ALEX, SAM],
    selectedOptionIndex: 2,
    ...overrides,
  };

  render(<RoundReveal {...props} />);

  return props;
}

function optionItems() {
  return within(screen.getByLabelText("Answer options")).getAllByRole("listitem");
}

describe("round reveal", () => {
  it("congratulates a correct answer and explains it", () => {
    renderReveal();

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("collect is terminal")).toBeInTheDocument();
    expect(screen.getByText("Which of these Stream operations is terminal?")).toBeInTheDocument();
  });

  it("shows every option with the correct one identified", () => {
    renderReveal({ selectedOptionIndex: 0 });

    const options = optionItems();

    expect(options).toHaveLength(4);
    expect(screen.getByText("Not quite")).toBeInTheDocument();
    expect(options[2]).toHaveTextContent("collect");
    expect(options[0]).toHaveTextContent("map");
  });

  it("reports a missed round when the timer ran out", () => {
    renderReveal({ selectedOptionIndex: null });

    expect(screen.getByText("Time up")).toBeInTheDocument();
  });

  it("skips the question panel when no question is available", () => {
    renderReveal({ question: null });

    expect(screen.queryByLabelText("Answer options")).not.toBeInTheDocument();
    expect(screen.getByText("Scoreboard")).toBeInTheDocument();
  });

  it("ranks the scoreboard with scores and streaks", () => {
    renderReveal();

    const rows = within(screen.getByLabelText("Scoreboard")).getAllByRole("listitem");

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Alex");
    expect(rows[0]).toHaveTextContent("1,250");
    expect(rows[0]).toHaveTextContent("2 streak");
    expect(rows[1]).toHaveTextContent("Sam");
    expect(rows[1]).not.toHaveTextContent("streak");
  });
});
