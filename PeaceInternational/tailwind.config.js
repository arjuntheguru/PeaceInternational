/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./Views/**/*.cshtml",
    "./Areas/**/*.cshtml",
    "./Pages/**/*.cshtml",
    "./wwwroot/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        // Custom brand colors for tour company
        primary: {
          DEFAULT: '#0891b2', // cyan-600 - represents travel/water
          light: '#06b6d4',   // cyan-500
          dark: '#0e7490',    // cyan-700
        },
        secondary: {
          DEFAULT: '#f59e0b', // amber-500 - represents sun/warmth
          light: '#fbbf24',   // amber-400
          dark: '#d97706',    // amber-600
        }
      }
    },
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
          primary: "#0891b2",
          secondary: "#f59e0b",
          accent: "#8b5cf6",
          neutral: "#1f2937",
          "base-100": "#ffffff",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
    ],
  },
}
