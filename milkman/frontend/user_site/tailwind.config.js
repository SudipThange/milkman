/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pmDeep: "#450693",
        pmViolet: "#8C00FF",
        pmGold: "#FFC400",
        pmAccent: "#FFB33F",
        pmOff: "#FFF7DE",
      },
      boxShadow: {
        soft: "0 10px 35px rgba(69, 6, 147, 0.18)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
