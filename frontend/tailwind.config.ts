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
      fontFamily: {
        display: ["'Space Grotesk Variable'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          "'JetBrains Mono Variable'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      keyframes: {
        drift: {
          "0%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(3%, -4%, 0) scale(1.12)" },
          "100%": { transform: "translate3d(-3%, 3%, 0) scale(1.04)" },
        },
        "gradient-pan": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        sheen: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "pulse-ring": {
          "0%": { opacity: "0.7", transform: "scale(0.92)" },
          "70%": { opacity: "0", transform: "scale(1.35)" },
          "100%": { opacity: "0", transform: "scale(1.35)" },
        },
      },
      animation: {
        drift: "drift 26s ease-in-out infinite alternate",
        "gradient-pan": "gradient-pan 8s ease infinite",
        sheen: "sheen 1.1s ease-in-out",
        "pulse-ring": "pulse-ring 1s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
