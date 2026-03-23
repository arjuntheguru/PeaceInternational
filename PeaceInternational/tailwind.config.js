/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./Views/**/*.cshtml",
    "./Areas/**/*.cshtml",
    "./Pages/**/*.cshtml",
    "./wwwroot/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    logs: false,
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          primary: "#3d8b5e",
          "primary-focus": "#337a50",
          "primary-content": "#ffffff",

          secondary: "#64748b",
          "secondary-focus": "#475569",
          "secondary-content": "#ffffff",

          accent: "#8B7355",
          "accent-focus": "#7a6448",
          "accent-content": "#ffffff",

          neutral: "#1e293b",
          "neutral-content": "#f8fafc",

          "base-100": "#ffffff",
          "base-200": "#f8f8f7",
          "base-300": "#ebebea",
          "base-content": "#1e293b",

          info: "#6366f1",
          success: "#3d8b5e",
          warning: "#d97706",
          error: "#dc2626",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#5ba97a",
          "primary-focus": "#4d9169",
          "primary-content": "#ffffff",

          secondary: "#94a3b8",
          "secondary-focus": "#7c8da0",
          "secondary-content": "#0f172a",

          accent: "#a8916e",
          "accent-focus": "#8B7355",
          "accent-content": "#0f172a",

          neutral: "#1e293b",
          "neutral-content": "#e2e8f0",

          "base-100": "#0f172a",
          "base-200": "#1e293b",
          "base-300": "#334155",
          "base-content": "#e2e8f0",

          info: "#818cf8",
          success: "#5ba97a",
          warning: "#f59e0b",
          error: "#ef4444",
        }
      },
    ],
  },
}
