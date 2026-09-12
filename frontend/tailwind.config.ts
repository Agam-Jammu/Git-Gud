import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        arena: {
          background: "#0b1020",
          surface: "#151b33",
          border: "#243056",
          accent: "#5b8cff",
          correct: "#2fbf71",
          wrong: "#ef4d5b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
