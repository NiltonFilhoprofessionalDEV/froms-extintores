import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a"
        },
        danger: {
          50:  "#fff1f2",
          100: "#ffe4e6",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c"
        },
        success: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d"
        },
        warn: {
          50:  "#fffbeb",
          100: "#fef3c7",
          600: "#d97706",
          700: "#b45309"
        },
        surface: "#ffffff",
        canvas:  "#f1f5f9"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 4px 0 rgb(0 0 0 / .07), 0 4px 16px 0 rgb(0 0 0 / .06)",
        "card-lg": "0 2px 8px 0 rgb(0 0 0 / .08), 0 8px 24px 0 rgb(0 0 0 / .08)"
      }
    }
  },
  plugins: []
};

export default config;
