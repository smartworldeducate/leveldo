// -----------------------
// 🎨 COLORS
// -----------------------
export const COLORS = {
  primary: '#2eb872',
  primaryDark: '#16a34a',

  secondary: '#2eb872',
  secondaryDark: '#16a34a',

  accent: '#FFD700', // gold
  accentDark: '#C33764',

  white: '#FFFFFF',
  black: '#000000',

  gray100: '#fafafa',
  gray200: '#f3f6f7',
  gray300: '#eeeeee',
  gray400: '#dcdcdc',
  gray500: '#b1b1b1',
  gray600: '#7b7b7b',
  gray700: '#6b6b6b',
  gray800: '#333333',

  successLightBg: '#eef9f0',
  successLightBorder: '#dff0df',
};

// -----------------------
// 🌈 GRADIENTS
// -----------------------
export const GRADIENTS = {
  primaryBtn: ['#2eb872', '#16a34a'],
  gold: ['#FFD700', '#C33764'],
  softCard: ['#ffffff', '#f8f8f8'],
};

// -----------------------
// 🔠 FONT SIZES
// -----------------------
export const FONTS = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
};

// -----------------------
// 📏 SPACING
// -----------------------
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// -----------------------
// 🟦 BORDER RADII
// -----------------------
export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  rounded: 999,
};

// -----------------------
// 🕶 SHADOWS
// -----------------------
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
  },
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
};

// -----------------------
// 📐 SIZES (AVATAR / INPUTS / ETC.)
// -----------------------
export const SIZES = {
  inputHeight: 52,
  avatar: 110,
  socialBtnHeight: 42,
  socialBtnWidth: 58,
};

// -----------------------
// 🧩 THEME (LIGHT + DARK)
// -----------------------
export const THEME = {
  light: {
    background: COLORS.gray200,
    card: COLORS.white,
    text: COLORS.black,
    subtext: COLORS.gray600,
    border: COLORS.gray300,
  },
  dark: {
    background: '#0b0c10',
    card: '#1f2833',
    text: '#ffffff',
    subtext: '#c5c6c7',
    border: '#2b2b2b',
  },
};
