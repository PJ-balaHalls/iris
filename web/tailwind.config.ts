// web/tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/constants/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg-primary)",
        surface: "var(--color-bg-surface)",
        foreground: "var(--color-text-primary)",
        "foreground-secondary": "var(--color-text-secondary)",
        "foreground-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-subtle": "var(--color-accent-subtle)",
        emotion: "var(--color-emotion)",
        focus: "var(--color-focus-ring)",
        danger: "var(--color-danger)",
        success: "var(--color-success)",

        card: {
          DEFAULT: "var(--color-bg-surface)",
          foreground: "var(--color-text-primary)"
        },
        popover: {
          DEFAULT: "var(--color-bg-surface)",
          foreground: "var(--color-text-primary)"
        },
        primary: {
          DEFAULT: "var(--color-accent)",
          foreground: "#ffffff"
        },
        secondary: {
          DEFAULT: "var(--color-bg-surface)",
          foreground: "var(--color-text-primary)"
        },
        muted: {
          DEFAULT: "rgba(17, 17, 17, 0.06)",
          foreground: "var(--color-text-muted)"
        },
        destructive: {
          DEFAULT: "var(--color-danger)",
          foreground: "#ffffff"
        },
        input: "var(--color-border)",
        ring: "var(--color-focus-ring)"
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        dyslexic: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"]
      },
      fontSize: {
        detail: ["0.75rem", { lineHeight: "1.3" }],
        caption: ["0.875rem", { lineHeight: "1.4" }],
        body: ["1rem", { lineHeight: "1.5" }],
        lead: ["1.125rem", { lineHeight: "1.5" }],
        h3: ["1.5rem", { lineHeight: "1.3" }],
        h2: ["2rem", { lineHeight: "1.25" }],
        h1: ["2.5rem", { lineHeight: "1.2" }]
      },
      borderRadius: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "999px"
      },
      boxShadow: {
        irisSm: "var(--shadow-sm)",
        irisMd: "var(--shadow-md)",
        irisLg: "var(--shadow-lg)"
      },
      transitionTimingFunction: {
        iris: "cubic-bezier(0.2, 0.9, 0.4, 1.1)"
      }
    }
  },
  plugins: []
};

export default config;
