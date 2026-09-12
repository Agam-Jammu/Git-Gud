import { describe, expect, it } from "vitest";

describe("test environment", () => {
  it("provides a constructible ResizeObserver", () => {
    const observer = new ResizeObserver(() => undefined);

    expect(observer).toBeInstanceOf(ResizeObserver);
    expect(() => observer.disconnect()).not.toThrow();
  });

  it("reports reduced motion as enabled so animation never defers assertions", () => {
    expect(window.matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
  });

  it("reports unrelated media queries as unmatched", () => {
    expect(window.matchMedia("(min-width: 900px)").matches).toBe(false);
    expect(window.matchMedia("(prefers-color-scheme: dark)").matches).toBe(false);
  });

  it("accepts and removes media query listeners", () => {
    const list = window.matchMedia("(prefers-reduced-motion: reduce)");

    expect(() => {
      list.addEventListener("change", () => undefined);
      list.removeEventListener("change", () => undefined);
    }).not.toThrow();
  });
});
