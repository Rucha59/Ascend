/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Baloo 2'", "sans-serif"],
        body: ["Nunito", "sans-serif"],
      },
      colors: {
        peach: "#FF8B6B",
        teal: "#4FC9A8",
        moss: "#8FBE7A",
        sky: "#8FA6FF",
        rose: "#FF88AA",
      },
    },
  },
  plugins: [],
};
