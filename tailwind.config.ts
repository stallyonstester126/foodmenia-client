import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FCBA08",
        brandDark: "#2B1B0E",
        headingBlack: "#1A1A1A",
      },
      fontFamily: {
        mali: ["'Mali'", "'Sniglet'", "cursive", "sans-serif"],
        lilita: ["'Lilita One'", "var(--font-lilita)", "cursive", "sans-serif"],
        poppins: ["'Poppins'", "var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;


