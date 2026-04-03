/** @type {import('tailwindcss').Config} */
const daisyThemes = require("daisyui/src/theming/themes");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
        "light",
        {
          black: {
            ...daisyThemes["black"],
            "primary": "rgb(29,155,240)",
            "secondary": "rgb(24,24,24)",
          },
        }
    ]
  }
}

