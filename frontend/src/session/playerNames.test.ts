import { describe, expect, it } from "vitest";

import type { PlayerDto } from "../types";
import { isNameTaken } from "./playerNames";

function player(name: string): PlayerDto {
  return { name, score: 0, streak: 0, answered: false, host: false };
}

describe("isNameTaken", () => {
  it("matches an existing name exactly", () => {
    expect(isNameTaken([player("Alex")], "Alex")).toBe(true);
  });

  it("matches regardless of case", () => {
    expect(isNameTaken([player("Alex")], "alex")).toBe(true);
    expect(isNameTaken([player("alex")], "ALEX")).toBe(true);
  });

  it("ignores surrounding whitespace", () => {
    expect(isNameTaken([player("Alex")], "  Alex  ")).toBe(true);
  });

  it("reports a free name", () => {
    expect(isNameTaken([player("Alex")], "Sam")).toBe(false);
    expect(isNameTaken([], "Sam")).toBe(false);
  });
});
