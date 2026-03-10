/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                pmBlue900: "#1B4F72",
                pmBlue700: "#2E8BC0",
                pmBlue500: "#E3F3FB",
                pmIce100: "#FFF5E2",
                freshCoral: "#FF8559",
                farmGreen: "#4CAF50",
                softGray: "#E5E7EB",
                charcoal: "#111827",
            },
            boxShadow: {
                neon: "0 0 8px rgba(46, 139, 192, 0.36), 0 0 16px rgba(27, 79, 114, 0.24)",
            },
        },
    },
    plugins: [],
};