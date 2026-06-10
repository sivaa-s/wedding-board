/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fdf2f6",
          100: "#fce7ef",
          200: "#f9c5d8",
          400: "#e8729b",
          500: "#d4537e",
          600: "#b83d66",
          700: "#9a2c52",
        }
      }
    }
  },
  plugins: [],
}
