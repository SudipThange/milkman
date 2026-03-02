/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pmBlue900: "#0F2854",
        pmBlue700: "#1C4D8D",
        pmBlue500: "#4988C4",
        pmIce100: "#BDE8F5",
      },
      boxShadow: {
        neon: "0 0 8px rgba(189, 232, 245, 0.85), 0 0 16px rgba(73, 136, 196, 0.65)",
      },
    },
  },
  plugins: [],
};
