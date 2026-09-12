import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the title and tagline", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Git Gud" })).toBeInTheDocument();
    expect(screen.getByText("Real-time multiplayer developer trivia.")).toBeInTheDocument();
  });
});
