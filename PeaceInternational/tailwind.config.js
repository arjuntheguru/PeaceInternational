/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./Views/**/*.cshtml",
    "./Areas/**/*.cshtml",
    "./Pages/**/*.cshtml",
    "./wwwroot/js/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#3b82f6",        // Blue 500 - Vibrant and modern
          "primary-focus": "#2563eb", // Blue 600
          "primary-content": "#ffffff",

          secondary: "#8b5cf6",      // Violet 500 - Complementary
          "secondary-focus": "#7c3aed",
          "secondary-content": "#ffffff",

          accent: "#06b6d4",         // Cyan 500 - Fresh accent
          "accent-focus": "#0891b2",
          "accent-content": "#ffffff",

          neutral: "#1e293b",        // Slate 800
          "neutral-content": "#ffffff",

          "base-100": "#ffffff",
          "base-200": "#f8fafc",     // Slate 50
          "base-300": "#e2e8f0",     // Slate 200
          "base-content": "#1e293b",

          info: "#0ea5e9",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#60a5fa",        // Blue 400 - Bright for dark mode
          "primary-focus": "#3b82f6",
          "primary-content": "#ffffff",

          secondary: "#a78bfa",      // Violet 400
          "secondary-focus": "#8b5cf6",
          "secondary-content": "#ffffff",

          accent: "#22d3ee",         // Cyan 400
          "accent-focus": "#06b6d4",
          "accent-content": "#0f172a",

          neutral: "#1e293b",
          "neutral-content": "#f1f5f9",

          "base-100": "#0f172a",     // Slate 900
          "base-200": "#1e293b",     // Slate 800
          "base-300": "#334155",     // Slate 700
          "base-content": "#f1f5f9", // Slate 100

          info: "#38bdf8",
          success: "#34d399",
          warning: "#fbbf24",
          error: "#f87171",
        }
      },
    ],
  },
}
