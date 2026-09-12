import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchPracticeQuestions } from "../services/api";
import type { PracticeQuestionDto } from "../types";
import { PracticeScreen } from "./PracticeScreen";

vi.mock("../services/api", () => ({ fetchPracticeQuestions: vi.fn() }));

const loadMock = vi.mocked(fetchPracticeQuestions);

function question(id: number, correctOptionIndex: number): PracticeQuestionDto {
  return {
    id,
    category: "Java & Spring Boot",
    text: `Question ${id}`,
    codeSnippet: null,
    options: ["a", "b", "c", "d"],
    correctOptionIndex,
    explanation: `because ${id}`,
  };
}

function renderPractice() {
  render(
    <MemoryRouter>
      <PracticeScreen />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  loadMock.mockReset();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("practice screen", () => {
  it("shows the progress and the first question", async () => {
    loadMock.mockResolvedValue([question(1, 1), question(2, 1)]);
    renderPractice();

    expect(await screen.findByRole("heading", { name: "Question 1" })).toBeInTheDocument();
    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(/Correct:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "b" })).toBeEnabled();
  });

  it("reveals the outcome and explanation, then moves on", async () => {
    const user = userEvent.setup();
    loadMock.mockResolvedValue([question(1, 1), question(2, 1)]);
    renderPractice();

    await user.click(await screen.findByRole("button", { name: "b" }));

    expect(screen.getByText("Correct")).toBeInTheDocument();
    expect(screen.getByText("because 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "b" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next question" }));

    expect(screen.getByRole("heading", { name: "Question 2" })).toBeInTheDocument();
    expect(screen.queryByText("because 1")).not.toBeInTheDocument();
  });

  it("tells the player when an answer is wrong", async () => {
    const user = userEvent.setup();
    loadMock.mockResolvedValue([question(1, 1)]);
    renderPractice();

    await user.click(await screen.findByRole("button", { name: "a" }));

    expect(screen.getByText("Not quite")).toBeInTheDocument();
    expect(screen.getByText("because 1")).toBeInTheDocument();
  });

  it("summarises the score once every question is answered", async () => {
    const user = userEvent.setup();
    loadMock.mockResolvedValue([question(1, 1)]);
    renderPractice();

    await user.click(await screen.findByRole("button", { name: "b" }));
    await user.click(screen.getByRole("button", { name: "See results" }));

    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Practise again" })).toBeInTheDocument();
  });

  it("reports a load failure and can retry", async () => {
    const user = userEvent.setup();
    loadMock.mockRejectedValueOnce(new Error("offline"));
    loadMock.mockResolvedValueOnce([question(1, 1)]);
    renderPractice();

    expect(await screen.findByRole("alert")).toHaveTextContent("offline");

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("heading", { name: "Question 1" })).toBeInTheDocument();
  });

  it("explains when no questions are available", async () => {
    loadMock.mockResolvedValue([]);
    renderPractice();

    expect(await screen.findByText("No practice questions are available yet.")).toBeInTheDocument();
  });
});
