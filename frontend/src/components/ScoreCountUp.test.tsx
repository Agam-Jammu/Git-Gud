import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScoreCountUp } from "./ScoreCountUp";

describe("ScoreCountUp", () => {
  it("reaches the final score immediately while reduced motion is preferred", () => {
    render(<ScoreCountUp value={3_000} />);

    expect(screen.getByText("3,000")).toBeInTheDocument();
  });

  it("groups thousands", () => {
    render(<ScoreCountUp value={1_234_567} />);

    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("handles a zero score", () => {
    render(<ScoreCountUp value={0} />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
