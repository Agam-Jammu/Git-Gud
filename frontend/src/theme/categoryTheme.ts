import type { CSSProperties } from "react";

import { blendRgb } from "./colour";

export type CategoryKey = "git" | "java" | "sql" | "web" | "default";

export interface CategoryTheme {
  key: CategoryKey;
  accentRgb: string;
  accentEndRgb: string;
  baseRgb: string;
  surfaceRgb: string;
}

const BASE_RGB = "11 16 32";
const SURFACE_RGB = "21 27 51";
const BASE_TINT = 0.18;
const SURFACE_TINT = 0.14;

function theme(key: CategoryKey, accentRgb: string, accentEndRgb: string): CategoryTheme {
  return {
    key,
    accentRgb,
    accentEndRgb,
    baseRgb: blendRgb(BASE_RGB, accentRgb, BASE_TINT),
    surfaceRgb: blendRgb(SURFACE_RGB, accentRgb, SURFACE_TINT),
  };
}

const DEFAULT_THEME = theme("default", "91 140 255", "232 121 249");

const THEMES: Record<string, CategoryTheme> = {
  "git & linux": theme("git", "52 211 153", "250 204 21"),
  "java & spring boot": theme("java", "248 113 113", "167 139 250"),
  "sql & databases": theme("sql", "251 191 36", "244 114 182"),
  "web & cloud architecture": theme("web", "34 211 238", "129 140 248"),
};

export interface CategoryStyle extends CSSProperties {
  "--cat-accent-rgb": string;
  "--cat-accent-end-rgb": string;
  "--cat-base-rgb": string;
  "--cat-surface-rgb": string;
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
    "--cat-base-rgb": theme.baseRgb,
    "--cat-surface-rgb": theme.surfaceRgb,
  };
}
