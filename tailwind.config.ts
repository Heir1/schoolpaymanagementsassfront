import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        schoolpay: {
          blue: "#1e5a8e",
          "blue-light": "#2d7ab8",
          "blue-soft": "#e8f2f8",
          green: "#2d8a5e",
          "green-soft": "#e8f5ee",
          yellow: "#e8b923",
          "yellow-soft": "#fef9e7",
          neutral: "#4a5568",
          "neutral-light": "#f7fafc",
          text: "#2d3748",
          dark: "#0f172a",
          "dark-light": "#1e293b",
          accent: "#0d9488",
          "accent-hover": "#0f766e",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px rgba(30, 90, 142, 0.08)",
        "soft-hover": "0 8px 30px rgba(30, 90, 142, 0.12)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.08)",
        cta: "0 4px 14px rgba(13, 148, 136, 0.35)",
      },
      maxWidth: {
        "section": "72rem",
        "prose": "65ch",
      },
      letterSpacing: {
        "section": "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
