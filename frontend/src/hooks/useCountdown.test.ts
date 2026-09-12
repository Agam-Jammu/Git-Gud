import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "./useCountdown";

const NOW = new Date("2026-01-01T00:00:00.000Z").getTime();

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports the whole seconds left before the deadline", () => {
    const { result } = renderHook(() => useCountdown(NOW + 10_000));

    expect(result.current).toBe(10);
  });

  it("rounds a partial second up so the timer shows 1 before zero", () => {
    const { result } = renderHook(() => useCountdown(NOW + 1_200));

    expect(result.current).toBe(2);
  });

  it("counts down as time passes", () => {
    const { result } = renderHook(() => useCountdown(NOW + 10_000));

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current).toBe(7);
  });

  it("never reports less than zero", () => {
    const { result } = renderHook(() => useCountdown(NOW + 1_000));

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(result.current).toBe(0);
  });

  it("restarts when the deadline changes", () => {
    const { result, rerender } = renderHook(({ deadline }) => useCountdown(deadline), {
      initialProps: { deadline: NOW + 10_000 },
    });

    expect(result.current).toBe(10);

    rerender({ deadline: NOW + 4_000 });

    expect(result.current).toBe(4);
  });
});
