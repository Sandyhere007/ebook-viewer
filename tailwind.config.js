/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'charcoal': '#121110',
        'obsidian': '#1a1816',
        'gold': '#d4af37',
        'gold-light': '#e5c158',
        'gold-bright': '#f4d957',
        'gold-accent': '#ffd700',
        'ivory': '#fbf9f3',
        'cream': '#fbeee0',
      },
      fontFamily: {
        serif: ['Merriweather', 'Lora', 'Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        'book': '18px',
      },
      lineHeight: {
        'relaxed': '1.6',
      },
      backgroundImage: {
        'gradient-to-br': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
