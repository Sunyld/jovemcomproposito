/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: 'var(--color-bg)' },
        surface: { DEFAULT: 'var(--color-surface)' },
        purple: { DEFAULT: 'var(--color-accent)', light: 'var(--color-accent-light)' },
        text: { primary: 'var(--color-text)', secondary: 'var(--color-text-secondary)' },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        border: { DEFAULT: 'rgba(255, 255, 255, 0.1)', light: 'rgba(0, 0, 0, 0.1)' },
        input: { DEFAULT: 'rgba(255, 255, 255, 0.05)', light: 'rgba(0, 0, 0, 0.05)' }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(1200px 600px at 100% 0%, rgba(124,92,255,0.25) 0%, rgba(11,11,16,0) 60%), linear-gradient(180deg, #0B0B10 0%, #0F1116 100%)',
        'card-glow': 'linear-gradient(135deg, rgba(124,92,255,0.2) 0%, rgba(155,140,255,0.15) 100%)'
      },
      boxShadow: {
        'soft-3d': '0 10px 30px -10px rgba(124,92,255,0.35), inset 0 1px 0 0 rgba(255,255,255,0.05)',
        'elevate': '0 10px 20px -10px rgba(0,0,0,0.6), 0 20px 60px -30px rgba(124,92,255,0.35)'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem'
      }
    },
  },
  plugins: [],
};
