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
          primary: "#62b982",
          "primary-focus": "#4fa36e",
          "primary-content": "#07130b",

          secondary: "#a3a3a3",
          "secondary-focus": "#8a8a8a",
          "secondary-content": "#0a0a0a",

          accent: "#c9a66b",
          "accent-focus": "#b89051",
          "accent-content": "#120d05",

          neutral: "#262626",
          "neutral-content": "#f5f5f5",

          "base-100": "#171717",
          "base-200": "#0a0a0a",
          "base-300": "#303030",
          "base-content": "#ededed",

          info: "#70a7d8",
          success: "#62b982",
          warning: "#e5a94d",
          error: "#f06b6b",
        }
      },
    ],
  },
}
