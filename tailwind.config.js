/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        "bounce-once": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "40%": { transform: "scale(1.1)", opacity: "1" },
          "60%": { transform: "scale(0.95)" },
          "80%": { transform: "scale(1.02)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "wa-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
          "50%": { transform: "translateY(0)" },
          "70%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "bounce-once": "bounce-once 0.6s ease-out forwards",
        "wa-bounce": "wa-bounce 0.8s ease-in-out",
      },
    },
  },
  plugins: [],
};
