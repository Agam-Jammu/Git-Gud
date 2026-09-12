import { describe, expect, it } from "vitest";

import { fadeRise, liftOnHover } from "./presets";

function visibleOf(variants: typeof fadeRise): Record<string, unknown> {
  return variants.visible as unknown as Record<string, unknown>;
}

describe("motion presets", () => {
  it("defines both a hidden and a visible state", () => {
    expect(fadeRise.hidden).toBeDefined();
    expect(fadeRise.visible).toBeDefined();
  });

  it("finishes fully opaque so content is never left hidden", () => {
    expect(visibleOf(fadeRise).opacity).toBe(1);
  });

  it("lands at its resting transform", () => {
    expect(visibleOf(fadeRise).y).toBe(0);
  });

  it("exposes hover and press gestures", () => {
    expect(liftOnHover.whileHover).toMatchObject({ y: expect.any(Number) });
    expect(liftOnHover.whileTap).toMatchObject({ scale: expect.any(Number) });
  });
});
