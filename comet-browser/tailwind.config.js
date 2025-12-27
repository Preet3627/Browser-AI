/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space-bg': '#0D0E1C',
        'deep-space-primary': '#4A00B0', // A deep purple
        'deep-space-secondary': '#8A2BE2', // A slightly lighter purple
        'deep-space-accent-neon': '#00FFFF', // Neon cyan for accents
        'deep-space-text': '#E0E0E0',
        'deep-space-border': 'rgba(255, 255, 255, 0.1)', // Subtle white for borders
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
module.exports = config;