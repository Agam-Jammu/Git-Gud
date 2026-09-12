import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Countdown } from "./Countdown";

describe("countdown", () => {
  it("shows the remaining seconds", () => {
    render(<Countdown secondsRemaining={3} />);

    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
