import { describe, expect, it } from "vitest";

import { categoryStyle, categoryTheme } from "./categoryTheme";

const SERVER_CATEGORIES = [
  "Git & Linux",
  "Java & Spring Boot",
  "SQL & Databases",
  "Web & Cloud Architecture",
];

const RGB_TRIPLET = /^\d{1,3} \d{1,3} \d{1,3}$/;

describe("categoryTheme", () => {
  it("gives every server category its own key and accent", () => {
    const themes = SERVER_CATEGORIES.map(categoryTheme);

    expect(new Set(themes.map((theme) => theme.key)).size).toBe(4);
    expect(new Set(themes.map((theme) => theme.accentRgb)).size).toBe(4);
  });

  it("maps the known categories to distinct keys", () => {
    expect(categoryTheme("Git & Linux").key).toBe("git");
    expect(categoryTheme("Java & Spring Boot").key).toBe("java");
    expect(categoryTheme("SQL & Databases").key).toBe("sql");
    expect(categoryTheme("Web & Cloud Architecture").key).toBe("web");
  });

  it("ignores case and surrounding whitespace", () => {
    expect(categoryTheme("  git & linux  ").key).toBe("git");
    expect(categoryTheme("JAVA & SPRING BOOT").key).toBe("java");
  });

  it("falls back to the current arena accent for an unknown category", () => {
    const fallback = categoryTheme("Rust & Cargo");

    expect(fallback.key).toBe("default");
    expect(fallback.accentRgb).toBe("91 140 255");
  });

  it("falls back when the category is missing", () => {
    expect(categoryTheme("").key).toBe("default");
    expect(categoryTheme("   ").key).toBe("default");
    expect(categoryTheme(null).key).toBe("default");
    expect(categoryTheme(undefined).key).toBe("default");
  });

  it("only ever emits valid rgb triplets", () => {
    for (const category of [...SERVER_CATEGORIES, "unknown"]) {
      const theme = categoryTheme(category);

      expect(theme.accentRgb).toMatch(RGB_TRIPLET);
      expect(theme.accentEndRgb).toMatch(RGB_TRIPLET);
    }
  });

  it("exposes a theme as css custom properties", () => {
    const style = categoryStyle(categoryTheme("SQL & Databases"));

    expect(style["--cat-accent-rgb"]).toBe("251 191 36");
    expect(style["--cat-accent-end-rgb"]).toBe("248 113 113");
  });

  it("exposes the default theme as css custom properties", () => {
    const style = categoryStyle(categoryTheme("unknown"));

    expect(style["--cat-accent-rgb"]).toBe("91 140 255");
    expect(style["--cat-accent-end-rgb"]).toBe("232 121 249");
  });

  it("keeps the two gradient stops far enough apart to stay visible", () => {
    for (const category of [...SERVER_CATEGORIES, "unknown"]) {
      const theme = categoryTheme(category);
      const [accentRed, accentGreen, accentBlue] = theme.accentRgb.split(" ").map(Number);
      const [endRed, endGreen, endBlue] = theme.accentEndRgb.split(" ").map(Number);
      const distance = Math.sqrt(
        (accentRed - endRed) ** 2 + (accentGreen - endGreen) ** 2 + (accentBlue - endBlue) ** 2,
      );

      expect(distance).toBeGreaterThan(90);
    }
  });

  it("gives every category its own base colour", () => {
    const bases = [...SERVER_CATEGORIES, "unknown"].map(
      (category) => categoryTheme(category).baseRgb,
    );

    expect(new Set(bases).size).toBe(bases.length);

    for (const base of bases) {
      expect(base).toMatch(RGB_TRIPLET);
    }
  });

  it("keeps every base dark enough for muted copy to stay readable", () => {
    const luminance = (triplet: string) => {
      const channels = triplet
        .split(" ")
        .map(Number)
        .map((channel) => {
          const value = channel / 255;

          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });

      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };

    const contrast = (one: number, other: number) => {
      const lighter = Math.max(one, other);
      const darker = Math.min(one, other);

      return (lighter + 0.05) / (darker + 0.05);
    };

    const slate400 = luminance("148 163 184");

    for (const category of [...SERVER_CATEGORIES, "unknown"]) {
      const ratio = contrast(luminance(categoryTheme(category).baseRgb), slate400);

      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
