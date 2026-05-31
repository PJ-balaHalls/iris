// Tailwind extension snippet for IRÍS
module.exports = {
  theme: {
    extend: {
      colors: {
        iris: {
          background: '#FAF7F2',
          surface: '#FFFFFF',
          text: '#183A2E',
          gold: '#B9995A',
          lilac: '#9A7CA7',
          border: '#E0DDD6',
          dark: '#111111'
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Didot', 'Georgia', 'serif'],
        body: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      borderRadius: {
        md: '12px',
        lg: '16px',
        xl: '24px'
      },
      boxShadow: {
        iris: '0 10px 20px rgba(0,0,0,0.10)'
      }
    }
  }
}
