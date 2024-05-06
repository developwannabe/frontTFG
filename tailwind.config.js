/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./clnt/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Usualmente usado como el color base
          600: '#4f46e5', // Tu color personalizado puede ser el base o cualquier otro tono
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81'
        }
      }
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

