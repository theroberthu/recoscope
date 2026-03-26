import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0a0a0f",
        surface: "#12121a",
        "surface-light": "#1a1a25",
        cyan: {
          DEFAULT: "#00d4aa",
          dim: "#00d4aa80",
        },
        coral: {
          DEFAULT: "#ff4d6a",
          dim: "#ff4d6a80",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        sans: ["'Outfit'", "system-ui", "sans-serif"],
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
          "0%, 100%": { boxShadow: "0 0 20px #00d4aa40" },
          "50%": { boxShadow: "0 0 30px #00d4aa60" },
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
