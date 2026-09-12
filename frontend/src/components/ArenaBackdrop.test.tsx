import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArenaBackdrop } from "./ArenaBackdrop";

function backdrop() {
  return screen.getByTestId("arena-backdrop");
}

describe("ArenaBackdrop", () => {
  it("is hidden from assistive technology", () => {
    render(<ArenaBackdrop />);

    expect(backdrop()).toHaveAttribute("aria-hidden", "true");
  });

  it("never intercepts pointer events", () => {
    render(<ArenaBackdrop />);

    expect(backdrop()).toHaveClass("pointer-events-none");
  });

  it("sits behind the content", () => {
    render(<ArenaBackdrop />);

    expect(backdrop()).toHaveClass("fixed", "inset-0", "-z-10");
  });

  it("uses the default accent when no category is given", () => {
    render(<ArenaBackdrop />);

    const style = backdrop().getAttribute("style") ?? "";

    expect(style).toContain("--cat-accent-rgb");
    expect(style).toContain("91 140 255");
  });

  it("adopts the accent of the given category", () => {
    render(<ArenaBackdrop category="SQL & Databases" />);

    const style = backdrop().getAttribute("style") ?? "";

    expect(style).toContain("251 191 36");
    expect(style).toContain("251 146 60");
  });

  it("falls back to the default accent for an unknown category", () => {
    render(<ArenaBackdrop category="Rust & Cargo" />);

    const style = backdrop().getAttribute("style") ?? "";

    expect(style).toContain("91 140 255");
  });

  it("drifts two layers on the shared keyframe", () => {
    render(<ArenaBackdrop />);

    const layers = backdrop().querySelectorAll(".animate-drift");

    expect(layers).toHaveLength(2);
  });
});
