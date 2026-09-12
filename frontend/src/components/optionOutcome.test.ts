import { describe, expect, it } from "vitest";

import { optionOutcome, optionOutcomeClass } from "./optionOutcome";

describe("option outcome", () => {
  it("marks the correct option however the player answered", () => {
    expect(optionOutcome(2, 2, 0)).toBe("correct");
    expect(optionOutcome(2, 2, 2)).toBe("correct");
    expect(optionOutcome(2, 2, null)).toBe("correct");
  });

  it("marks the picked option when it is wrong", () => {
    expect(optionOutcome(0, 2, 0)).toBe("chosen");
  });

  it("leaves the other options neutral", () => {
    expect(optionOutcome(1, 2, 0)).toBe("neutral");
  });

  it("maps every outcome to a distinct style", () => {
    const styles = new Set([
      optionOutcomeClass("correct"),
      optionOutcomeClass("chosen"),
      optionOutcomeClass("neutral"),
    ]);

    expect(styles.size).toBe(3);
  });
});
