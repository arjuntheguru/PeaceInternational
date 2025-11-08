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
          primary: "#4A7C59",
          "primary-focus": "#3d6649",
          "primary-content": "#ffffff",

          secondary: "#6B8E7F",
          "secondary-focus": "#5a7869",
          "secondary-content": "#ffffff",

          accent: "#D4A574",
          "accent-focus": "#c89560",
          "accent-content": "#2d2d2d",

          neutral: "#2d2d2d",
          "neutral-content": "#ffffff",

          "base-100": "#fafaf9",
          "base-200": "#f5f5f4",
          "base-300": "#e7e5e4",
          "base-content": "#2d2d2d",

          info: "#5B9BD5",
          success: "#4A7C59",
          warning: "#D4A574",
          error: "#C85A54",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["dark"],
          primary: "#6B8E7F",
          "primary-focus": "#5a7869",
          "primary-content": "#ffffff",

          secondary: "#4A7C59",
          "secondary-focus": "#3d6649",
          "secondary-content": "#ffffff",

          accent: "#D4A574",
          "accent-focus": "#c89560",
          "accent-content": "#1a1a1a",

          neutral: "#2d2d2d",
          "neutral-content": "#e7e5e4",

          "base-100": "#1a1a1a",
          "base-200": "#2d2d2d",
          "base-300": "#404040",
          "base-content": "#e7e5e4",

          info: "#5B9BD5",
          success: "#6B8E7F",
          warning: "#D4A574",
          error: "#C85A54",
        }
      },
    ],
  },
}
