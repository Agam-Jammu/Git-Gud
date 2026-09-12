import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

const OPTION_NAMES = ["map", "filter", "collect", "peek"];

describe("question card", () => {
  it("renders the prompt, every option and a snippet when present", () => {
    render(
      <QuestionCard
        question={{ ...QUESTION, codeSnippet: "rows.stream().count();" }}
        selectedOptionIndex={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: QUESTION.text })).toBeInTheDocument();
    expect(screen.getByText("rows.stream().count();")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  it("omits the snippet when the question has none", () => {
    render(<QuestionCard question={QUESTION} selectedOptionIndex={null} onSelect={vi.fn()} />);

    expect(screen.queryByText("rows.stream().count();")).not.toBeInTheDocument();
  });

  it("reports the index of the option the player picks", async () => {
    const onSelect = vi.fn();
    render(<QuestionCard question={QUESTION} selectedOptionIndex={null} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "peek" }));

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it("marks the chosen option and locks the rest", () => {
    render(<QuestionCard question={QUESTION} selectedOptionIndex={1} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: "filter" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "map" })).toHaveAttribute("aria-pressed", "false");

    for (const name of OPTION_NAMES) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(screen.getByText("Answer locked in. Waiting for the others...")).toBeInTheDocument();
  });

  it("does not send the options back to their hidden state when an answer is chosen", async () => {
    const { rerender } = render(
      <QuestionCard question={QUESTION} selectedOptionIndex={null} onSelect={vi.fn()} />,
    );

    const wrapper = () => screen.getByRole("button", { name: "map" }).parentElement;

    await waitFor(() => {
      expect(wrapper()?.getAttribute("style") ?? "").toContain("opacity: 1");
    });

    const settled = wrapper()?.getAttribute("style") ?? "";

    rerender(<QuestionCard question={QUESTION} selectedOptionIndex={2} onSelect={vi.fn()} />);

    expect(wrapper()?.getAttribute("style") ?? "").toBe(settled);
  });
});
