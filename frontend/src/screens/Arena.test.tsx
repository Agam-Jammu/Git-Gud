import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { QuestionStartPayload } from "../types";
import { Arena, type ArenaProps } from "./Arena";

const QUESTION: QuestionStartPayload = {
  question: {
    id: 7,
    category: "Java & Spring Boot",
    text: "Which of these Stream operations is terminal?",
    codeSnippet: null,
    options: ["map", "filter", "collect", "peek"],
    deadlineEpochMs: 1_000_000,
  },
  questionNumber: 2,
  totalQuestions: 5,
};

function renderArena(overrides: Partial<ArenaProps> = {}) {
  const props: ArenaProps = {
    question: QUESTION,
    secondsRemaining: 8,
    selectedOptionIndex: null,
    onSelect: vi.fn(),
    ...overrides,
  };

  render(<Arena {...props} />);

  return props;
}

describe("arena", () => {
  it("shows the position, category, timer and options", () => {
    renderArena();

    expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("Java & Spring Boot")).toBeInTheDocument();
    expect(screen.getByLabelText("Seconds remaining")).toHaveTextContent("8");
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("reports the option the player picks", async () => {
    const user = userEvent.setup();
    const props = renderArena();

    await user.click(screen.getByRole("button", { name: "collect" }));

    expect(props.onSelect).toHaveBeenCalledWith(2);
  });

  it("locks the options once the player has answered", () => {
    const props = renderArena({ selectedOptionIndex: 2 });

    expect(screen.getByRole("button", { name: "collect" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "map" })).toBeDisabled();
    expect(props.onSelect).not.toHaveBeenCalled();
  });

  it("themes the screen with the accent of the question category", () => {
    renderArena();

    const style = screen.getByRole("main").getAttribute("style") ?? "";

    expect(style).toContain("--cat-accent-rgb");
    expect(style).toContain("167 139 250");
  });

  it("keeps the timer on the category colour above three seconds", () => {
    renderArena({ secondsRemaining: 8 });

    const timer = screen.getByLabelText("Seconds remaining");

    expect(timer).toHaveClass("cat-accent-text");
    expect(timer).not.toHaveClass("text-arena-wrong");
  });

  it("turns the timer urgent at three seconds or less", () => {
    renderArena({ secondsRemaining: 3 });

    const timer = screen.getByLabelText("Seconds remaining");

    expect(timer).toHaveClass("text-arena-wrong");
    expect(timer).toHaveClass("animate-pulse");
  });
});
