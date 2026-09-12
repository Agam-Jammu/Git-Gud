import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Countdown } from "./Countdown";

describe("countdown", () => {
  it("shows the remaining seconds", () => {
    render(<Countdown secondsRemaining={3} />);

    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("stays on the calm accent at three seconds", () => {
    render(<Countdown secondsRemaining={3} />);

    expect(screen.getByText("3")).toHaveStyle({ color: "rgb(91, 140, 255)" });
  });

  it("ramps towards the urgent colour at two seconds", () => {
    render(<Countdown secondsRemaining={2} />);

    expect(screen.getByText("2")).toHaveStyle({ color: "rgb(165, 109, 173)" });
  });

  it("reaches the urgent colour at one second", () => {
    render(<Countdown secondsRemaining={1} />);

    expect(screen.getByText("1")).toHaveStyle({ color: "rgb(239, 77, 91)" });
  });

  it("matches the ring to the number colour", () => {
    render(<Countdown secondsRemaining={1} />);

    const ring = screen.getByTestId("countdown-ring");

    expect(ring).toHaveClass("animate-pulse-ring");
    expect(ring).toHaveStyle({ borderColor: "rgb(239, 77, 91)" });
  });
});
