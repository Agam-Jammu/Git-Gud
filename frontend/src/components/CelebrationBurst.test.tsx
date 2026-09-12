import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CelebrationBurst } from "./CelebrationBurst";

describe("CelebrationBurst", () => {
  it("is decorative only", () => {
    const { container } = render(<CelebrationBurst />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("scatters several particles", () => {
    const { container } = render(<CelebrationBurst />);

    const root = container.firstElementChild;

    expect(root?.querySelectorAll("span")).toHaveLength(5);
  });

  it("never intercepts pointer events", () => {
    const { container } = render(<CelebrationBurst />);

    expect(container.firstElementChild).toHaveClass("pointer-events-none");
  });
});
