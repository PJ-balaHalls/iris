/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        flora: {
          offwhite: '#FAF9F6',
          black: '#121212',
          white: '#FFFFFF',
          gray: '#8E8E93',
          green: '#81C784', // Discreto para onboarding/flora
        },
        ilife: {
          DEFAULT: '#4CAF50',
          soft: '#E8F5E9',
        },
        uslife: {
          DEFAULT: '#9C27B0',
          soft: '#F3E5F5',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
};