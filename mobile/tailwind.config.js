// mobile/tailwind.config.js
/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F2",
        surface: "#FFFFFF",
        foreground: "#111111",
        "foreground-secondary": "#444444",
        "foreground-muted": "#666666",
        border: "#E0DDD6",
        accent: "#006D4E",
        "accent-subtle": "#183A2E",
        emotion: "#9A7CA7",
        focus: "#006D4E",
        danger: "#B42318",
        success: "#006D4E",
        black: "#111111",
        white: "#FFFFFF"
      },
      fontSize: {
        detail: ["12px", { lineHeight: "16px" }],
        caption: ["14px", { lineHeight: "20px" }],
        body: ["16px", { lineHeight: "24px" }],
        lead: ["18px", { lineHeight: "27px" }],
        h3: ["24px", { lineHeight: "31px" }],
        h2: ["32px", { lineHeight: "40px" }],
        h1: ["40px", { lineHeight: "48px" }]
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        full: "999px"
      },
      boxShadow: {
        irisSm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        irisMd: "0 4px 8px rgba(0, 0, 0, 0.08)",
        irisLg: "0 10px 20px rgba(0, 0, 0, 0.10)"
      }
    }
  },
  plugins: []
};
