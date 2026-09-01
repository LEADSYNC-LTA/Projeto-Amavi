/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta extraída do protótipo Figma da Amavi
        blush: {
          DEFAULT: '#F7D9D4',
          light: '#FBEAE7',
          dark: '#F1C4BD',
        },
        taupe: {
          DEFAULT: '#D6CDC8',
          light: '#E4DDD9',
          dark: '#C2B7B1',
        },
        ink: {
          DEFAULT: '#171412',
          soft: '#3A3532',
        },
        cream: '#FBF8F6',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
      },
    },
  },
  plugins: [],
}
