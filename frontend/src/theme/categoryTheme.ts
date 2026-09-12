import type { CSSProperties } from "react";

export type CategoryKey = "git" | "java" | "sql" | "web" | "default";

export interface CategoryTheme {
  key: CategoryKey;
  accentRgb: string;
  accentEndRgb: string;
}

const DEFAULT_THEME: CategoryTheme = {
  key: "default",
  accentRgb: "91 140 255",
  accentEndRgb: "129 140 248",
};

const THEMES: Record<string, CategoryTheme> = {
  "git & linux": {
    key: "git",
    accentRgb: "52 211 153",
    accentEndRgb: "45 212 191",
  },
  "java & spring boot": {
    key: "java",
    accentRgb: "167 139 250",
    accentEndRgb: "232 121 249",
  },
  "sql & databases": {
    key: "sql",
    accentRgb: "251 191 36",
    accentEndRgb: "251 146 60",
  },
  "web & cloud architecture": {
    key: "web",
    accentRgb: "34 211 238",
    accentEndRgb: "96 165 250",
  },
};

export interface CategoryStyle extends CSSProperties {
  "--cat-accent-rgb": string;
  "--cat-accent-end-rgb": string;
}

export function categoryTheme(category: string | null | undefined): CategoryTheme {
  const normalised = category?.trim().toLowerCase();

  if (!normalised) {
    return DEFAULT_THEME;
  }

  return THEMES[normalised] ?? DEFAULT_THEME;
}

export function categoryStyle(theme: CategoryTheme): CategoryStyle {
  return {
    "--cat-accent-rgb": theme.accentRgb,
    "--cat-accent-end-rgb": theme.accentEndRgb,
  };
}
