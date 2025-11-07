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
          primary: "#334155",        // Slate 700 - Professional and modern
          secondary: "#64748b",      // Slate 500 - Subtle secondary
          accent: "#0ea5e9",         // Sky 500 - Clean accent
          neutral: "#1e293b",        // Slate 800
          "base-100": "#ffffff",
          "base-200": "#f8fafc",     // Slate 50
          "base-300": "#e2e8f0",     // Slate 200
          info: "#0ea5e9",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#64748b",        // Lighter slate for dark mode
          secondary: "#94a3b8",
          accent: "#38bdf8",
          neutral: "#1e293b",
          "base-100": "#0f172a",     // Slate 900
          "base-200": "#1e293b",     // Slate 800
          "base-300": "#334155",     // Slate 700
        }
      },
    ],
  },
}
