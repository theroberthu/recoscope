import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#f2eee6",
        surface: "#faf7f1",
        "surface-light": "#e8e1d6",
        brand: "#914b37",
        secondary: "#696057",
        ink: "#2c2a27",
        muted: "#696057",
        line: "#cdc4b8",
        cyan: {
          DEFAULT: "#914b37",
          dim: "#914b3780",
        },
        coral: {
          DEFAULT: "#b43f52",
          dim: "#b43f5280",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["Source Sans 3", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "bar-grow": {
          from: { width: "0%" },
          to: { width: "var(--bar-width)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulse_glow: {
          "0%, 100%": { boxShadow: "0 0 20px #914b3740" },
          "50%": { boxShadow: "0 0 30px #914b3760" },
        },
      },
      animation: {
        "bar-grow": "bar-grow 1.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
