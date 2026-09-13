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
    expect(style).toContain("248 113 113");
  });

  it("falls back to the default accent for an unknown category", () => {
    render(<ArenaBackdrop category="Rust & Cargo" />);

    const style = backdrop().getAttribute("style") ?? "";

    expect(style).toContain("91 140 255");
  });

  it("drifts three layers on the shared keyframe", () => {
    render(<ArenaBackdrop />);

    const layers = backdrop().querySelectorAll(".animate-drift");

    expect(layers).toHaveLength(3);
  });

  it("paints the category base colour behind everything", () => {
    render(<ArenaBackdrop category="Git & Linux" />);

    expect(backdrop()).toHaveClass("bg-[rgb(var(--cat-base-rgb))]");
    expect(backdrop().getAttribute("style") ?? "").toContain("--cat-base-rgb");
  });

  it("spreads both accent stops across the mesh", () => {
    render(<ArenaBackdrop />);

    const layers = backdrop().querySelectorAll(".animate-drift");
    const gradients = Array.from(layers).map(
      (layer) => layer.getAttribute("style") ?? "",
    );

    expect(gradients.filter((gradient) => gradient.includes("accent-rgb"))).toHaveLength(1);
    expect(gradients.filter((gradient) => gradient.includes("accent-end-rgb"))).toHaveLength(2);
  });
});
