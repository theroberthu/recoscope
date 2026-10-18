import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#f5f7f4",
        surface: "#ffffff",
        "surface-light": "#edf2ee",
        ink: "#22312c",
        muted: "#596a61",
        line: "#d8e1da",
        cyan: {
          DEFAULT: "#07685c",
          dim: "#07685c80",
        },
        coral: {
          DEFAULT: "#b43f52",
          dim: "#b43f5280",
        },
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
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
          "0%, 100%": { boxShadow: "0 0 20px #07685c40" },
          "50%": { boxShadow: "0 0 30px #07685c60" },
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
