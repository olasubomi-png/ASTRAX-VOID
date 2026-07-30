import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#8B5CF6",
          foreground: "#ffffff",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8B5CF6",
          600: "#7c3aed",
          700: "#6D28D9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        secondary: {
          DEFAULT: "#6D28D9",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#A855F7",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "#a1a1aa",
        },
        card: {
          DEFAULT: "rgba(15, 15, 20, 0.7)",
          foreground: "#ffffff",
        },
        border: "rgba(139, 92, 246, 0.2)",
        ring: "#8B5CF6",
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-orbitron)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.4)",
        "glow-lg": "0 0 40px rgba(139, 92, 246, 0.5)",
        "glow-accent": "0 0 25px rgba(168, 85, 247, 0.45)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.35), transparent)",
        "card-gradient": "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(109, 40, 217, 0.05) 100%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.3)" },
          "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
