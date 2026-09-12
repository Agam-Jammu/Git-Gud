import { describe, expect, it } from "vitest";

import { fadeRise, liftOnHover, popIn, staggerContainer, staggerItem } from "./presets";

const ENTRANCES = [fadeRise, staggerItem, popIn];

function visibleOf(variants: (typeof ENTRANCES)[number]): Record<string, unknown> {
  return variants.visible as unknown as Record<string, unknown>;
}

describe("motion presets", () => {
  it("defines both a hidden and a visible state for every entrance", () => {
    for (const variants of ENTRANCES) {
      expect(variants.hidden).toBeDefined();
      expect(variants.visible).toBeDefined();
    }
  });

  it("finishes every entrance fully opaque so content is never left hidden", () => {
    for (const variants of ENTRANCES) {
      expect(visibleOf(variants).opacity).toBe(1);
    }
  });

  it("lands every entrance at its resting transform", () => {
    for (const variants of ENTRANCES) {
      const visible = visibleOf(variants);

      expect(visible.y ?? 0).toBe(0);
      expect(visible.scale ?? 1).toBe(1);
    }
  });

  it("staggers and delays its children", () => {
    const visible = staggerContainer.visible as unknown as {
      transition: { staggerChildren: number; delayChildren: number };
    };

    expect(visible.transition.staggerChildren).toBeGreaterThan(0);
    expect(visible.transition.delayChildren).toBeGreaterThanOrEqual(0);
  });

  it("uses a spring for the emphasis pop", () => {
    const transition = visibleOf(popIn).transition as { type: string };

    expect(transition.type).toBe("spring");
  });

  it("exposes hover and press gestures", () => {
    expect(liftOnHover.whileHover).toMatchObject({ y: expect.any(Number) });
    expect(liftOnHover.whileTap).toMatchObject({ scale: expect.any(Number) });
  });
});
