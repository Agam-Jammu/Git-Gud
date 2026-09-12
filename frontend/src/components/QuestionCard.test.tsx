import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { QuestionDto } from "../types";
import { QuestionCard } from "./QuestionCard";

const QUESTION: QuestionDto = {
  id: 7,
  category: "Java & Spring Boot",
  text: "Which of these Stream operations is terminal?",
  codeSnippet: null,
  options: ["map", "filter", "collect", "peek"],
  deadlineEpochMs: 1_000_000,
};

describe("question card", () => {
  it("shows the position, category, prompt and every option", () => {
    render(<QuestionCard question={QUESTION} questionNumber={2} totalQuestions={5} />);

    expect(screen.getByText("Question 2 of 5")).toBeInTheDocument();
    expect(screen.getByText("Java & Spring Boot")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: QUESTION.text })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("collect")).toBeInTheDocument();
  });

  it("renders a code snippet only when the question has one", () => {
    const { rerender } = render(
      <QuestionCard question={QUESTION} questionNumber={1} totalQuestions={5} />,
    );

    expect(screen.queryByText("System.out.println(1);")).not.toBeInTheDocument();

    rerender(
      <QuestionCard
        question={{ ...QUESTION, codeSnippet: "System.out.println(1);" }}
        questionNumber={1}
        totalQuestions={5}
      />,
    );

    expect(screen.getByText("System.out.println(1);")).toBeInTheDocument();
  });
});
