import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sudoku-purple": "#7C3AED",
        "sudoku-pink": "#EC4899",
        "sudoku-yellow": "#FBBF24",
        "sudoku-green": "#10B981",
        "sudoku-bg": "#0F0A1E",
        "sudoku-card": "#1A1035",
      },
      fontFamily: {
        party: ["Nunito", "sans-serif"],
      },
    },
  },
};

export default config;
