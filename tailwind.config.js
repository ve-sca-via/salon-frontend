/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          black: "#000000",
          white: "#FFFFFF",
        },
        accent: {
          orange: "#F89C02",
        },
        neutral: {
          white: "#FFFFFF",
          gray: {
            600: "#E6E6E6",
            500: "#B0B0B0",
            400: "#555555",
          },
          black: "#000000",
        },
        bg: {
          primary: "#FFFFFF",
          secondary: "#F5F8FE",
          tertiary: "#CEE0F6",
        },
      },
      fontFamily: {
        display: ["Marcellus", "serif"],
        body: ["DM Sans", "sans-serif"],
        accent: ["Montserrat", "sans-serif"],
      },
      backgroundImage: {
        "gradient-blue": "linear-gradient(180deg, #F5F8FE 0%, #CEE0F6 100%)",
        "gradient-orange": "linear-gradient(135deg, #F89C02 0%, #FFB84D 100%)",
      },
    },
  },
  plugins: [],
};
