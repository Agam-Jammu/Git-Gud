import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountUp } from "./useCountUp";

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useCountUp", () => {
  it("starts from zero", () => {
    const { result } = renderHook(() => useCountUp(1_000, { reduceMotion: false }));

    expect(result.current).toBe(0);
  });

  it("counts up gradually rather than jumping", () => {
    const { result } = renderHook(() =>
      useCountUp(1_000, { durationMs: 1_000, reduceMotion: false }),
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(1_000);
  });

  it("lands exactly on the target once the duration elapses", () => {
    const { result } = renderHook(() =>
      useCountUp(1_500, { durationMs: 1_000, reduceMotion: false }),
    );

    act(() => {
      vi.advanceTimersByTime(1_200);
    });

    expect(result.current).toBe(1_500);
  });

  it("never overshoots the target", () => {
    const { result } = renderHook(() =>
      useCountUp(2_000, { durationMs: 400, reduceMotion: false }),
    );

    for (let elapsed = 0; elapsed < 800; elapsed += 50) {
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(result.current).toBeLessThanOrEqual(2_000);
    }
  });

  it("jumps straight to the target when reduced motion is preferred", () => {
    const { result } = renderHook(() => useCountUp(1_234, { reduceMotion: true }));

    expect(result.current).toBe(1_234);
  });

  it("counts on from the displayed value when the target changes", () => {
    const { result, rerender } = renderHook(
      ({ target }) => useCountUp(target, { durationMs: 400, reduceMotion: false }),
      { initialProps: { target: 1_000 } },
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(1_000);

    rerender({ target: 2_000 });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBeGreaterThan(1_000);
    expect(result.current).toBeLessThan(2_000);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe(2_000);
  });
});
