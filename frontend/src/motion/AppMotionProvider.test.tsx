import { render, screen, waitFor } from "@testing-library/react";
import { motion } from "motion/react";
import { describe, expect, it } from "vitest";

import { AppMotionProvider } from "./AppMotionProvider";
import { fadeRise } from "./presets";

function renderPanel() {
  render(
    <AppMotionProvider>
      <motion.div
        data-testid="panel"
        variants={fadeRise}
        initial="hidden"
        animate="visible"
      >
        <p>options</p>
      </motion.div>
    </AppMotionProvider>,
  );
}

describe("AppMotionProvider", () => {
  it("renders its children", () => {
    render(
      <AppMotionProvider>
        <p>arena content</p>
      </AppMotionProvider>,
    );

    expect(screen.getByText("arena content")).toBeInTheDocument();
  });

  it("keeps animated content queryable from the first render", () => {
    renderPanel();

    expect(screen.getByText("options")).toBeInTheDocument();
  });

  it("settles with no leftover entrance offset", async () => {
    renderPanel();

    await waitFor(() => {
      const style = screen.getByTestId("panel").getAttribute("style") ?? "";

      expect(style).not.toContain("translateY(16px)");
    });
  });
});
