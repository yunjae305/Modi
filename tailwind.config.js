export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 18px 45px rgba(91, 69, 242, 0.22)',
        card: '0 18px 45px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
