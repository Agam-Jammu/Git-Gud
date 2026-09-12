import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { PracticeQuestionDto } from "../types";
import { usePractice } from "./usePractice";

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

const QUESTIONS = [question(1, 1), question(2, 2)];

async function loaded(load: (limit: number) => Promise<PracticeQuestionDto[]>) {
  const view = renderHook(() => usePractice({ load }));
  await waitFor(() => expect(view.result.current.loading).toBe(false));
  return view;
}

describe("usePractice", () => {
  it("loads questions with the requested limit and starts on the first", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    expect(load).toHaveBeenCalledWith(5);
    expect(result.current.total).toBe(2);
    expect(result.current.current?.id).toBe(1);
    expect(result.current.finished).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("counts a correct answer", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.select(1);
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.selectedOptionIndex).toBe(1);
    expect(result.current.correctCount).toBe(1);
  });

  it("does not count an incorrect answer", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.select(3);
    });

    expect(result.current.selectedOptionIndex).toBe(3);
    expect(result.current.correctCount).toBe(0);
  });

  it("locks the answer once one has been given", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.select(0);
    });
    act(() => {
      result.current.select(1);
    });

    expect(result.current.selectedOptionIndex).toBe(0);
    expect(result.current.correctCount).toBe(0);
  });

  it("advances to the next question and clears the selection", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.select(1);
    });
    act(() => {
      result.current.next();
    });

    expect(result.current.current?.id).toBe(2);
    expect(result.current.index).toBe(1);
    expect(result.current.selectedOptionIndex).toBeNull();
    expect(result.current.correctCount).toBe(1);
  });

  it("finishes once every question has been answered", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.next();
    });
    act(() => {
      result.current.next();
    });

    expect(result.current.finished).toBe(true);
    expect(result.current.current).toBeNull();
  });

  it("reports a load failure", async () => {
    const load = vi.fn().mockRejectedValue(new Error("offline"));
    const { result } = await loaded(load);

    expect(result.current.error).toBe("offline");
    expect(result.current.finished).toBe(false);
  });

  it("reloads from the start when restarted", async () => {
    const load = vi.fn().mockResolvedValue(QUESTIONS);
    const { result } = await loaded(load);

    act(() => {
      result.current.next();
    });
    expect(result.current.current?.id).toBe(2);

    act(() => {
      result.current.restart();
    });

    await waitFor(() => expect(result.current.current?.id).toBe(1));
    expect(load).toHaveBeenCalledTimes(2);
  });
});
