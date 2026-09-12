import { describe, expect, it } from "vitest";

import { blendRgb, cssRgb, urgencyBlend } from "./colour";

const BLUE = "91 140 255";
const RED = "239 77 91";

describe("blendRgb", () => {
  it("returns the origin at zero", () => {
    expect(blendRgb(BLUE, RED, 0)).toBe(BLUE);
  });

  it("returns the destination at one", () => {
    expect(blendRgb(BLUE, RED, 1)).toBe(RED);
  });

  it("returns the midpoint at half", () => {
    expect(blendRgb(BLUE, RED, 0.5)).toBe("165 109 173");
  });

  it("clamps amounts outside zero to one", () => {
    expect(blendRgb(BLUE, RED, -2)).toBe(BLUE);
    expect(blendRgb(BLUE, RED, 4)).toBe(RED);
  });
});

describe("cssRgb", () => {
  it("converts a triplet into a comma separated colour", () => {
    expect(cssRgb("239 77 91")).toBe("rgb(239, 77, 91)");
    expect(cssRgb(BLUE)).toBe("rgb(91, 140, 255)");
  });
});

describe("urgencyBlend", () => {
  it("stays calm at three seconds or more", () => {
    expect(urgencyBlend(3)).toBe(0);
    expect(urgencyBlend(9)).toBe(0);
  });

  it("steps through the middle at two seconds", () => {
    expect(urgencyBlend(2)).toBe(0.5);
  });

  it("is fully urgent at one second or less", () => {
    expect(urgencyBlend(1)).toBe(1);
    expect(urgencyBlend(0)).toBe(1);
  });
});
