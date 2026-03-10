/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                milkBlue: "#2E8BC0",
                milkBlueLight: "#E3F3FB",
                deepDairyBlue: "#1B4F72",
                pastelCream: "#FFF5E2",
                freshCoral: "#FF8559",
                farmGreen: "#4CAF50",
                offWhite: "#F9FAFB",
                paperWhite: "#FFFFFF",
                softGray: "#E5E7EB",
                charcoal: "#111827",
                coolGray: "#6B7280",
                pmDeep: "#1B4F72",
                pmViolet: "#2E8BC0",
                pmGold: "#FF8559",
                pmAccent: "#FF8559",
                pmOff: "#F9FAFB",
            },
            boxShadow: {
                soft: "0 10px 30px rgba(27, 79, 114, 0.16)",
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