/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                "ivory-palace": "#FFFBF0",
                "warm-parchment": "#F5E6CA",
                "deep-saffron": "#D48B2D",
                "royal-brown": "#5C3A1E",
                "burnt-copper": "#B5541C",
                "milk-silk": "#FAF6EE",

                ivoryPalace: "#FFFBF0",
                warmParchment: "#F5E6CA",
                deepSaffron: "#D48B2D",
                royalBrown: "#5C3A1E",
                burntCopper: "#B5541C",
                milkSilk: "#FAF6EE",

                // Backward-compatible aliases used across existing components.
                milkBlue: "#D48B2D",
                milkBlueLight: "#F5E6CA",
                deepDairyBlue: "#5C3A1E",
                pastelCream: "#F5E6CA",
                freshCoral: "#B5541C",
                farmGreen: "#D48B2D",
                offWhite: "#FFFBF0",
                paperWhite: "#FAF6EE",
                softGray: "#D48B2D",
                charcoal: "#5C3A1E",
                coolGray: "#5C3A1E",
                pmDeep: "#5C3A1E",
                pmViolet: "#D48B2D",
                pmGold: "#D48B2D",
                pmAccent: "#B5541C",
                pmOff: "#FFFBF0",
            },
            boxShadow: {
                soft: "0 10px 30px rgba(92, 58, 30, 0.16)",
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