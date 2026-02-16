import { ThemeType, ThemeColors, ThemeColorProperties } from '../types';

// HSL'den HEX'e dönüştüren yardımcı fonksiyon
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Döngüsel soft pastel palet üreten fonksiyon
function generateCyclePalette(length: number = 100): string[] {
  const palette: string[] = [];
  for (let i = 0; i < length; i++) {
    const hue = (210 + (360 * i) / length) % 360;
    const sat = 60;
    const light = 85;
    palette.push(hslToHex(hue, sat, light));
  }
  return palette;
}

// CYCLE_PALETTE veya benzeri bir palet kullanıyorsan, gradient çifti almak için yardımcı fonksiyon:
function getGradientPair(index: number, palette: string[]): [string, string] {
  return [
    palette[index % palette.length],
    palette[(index + 1) % palette.length]
  ];
}

type PaletteColors = [string, string, string, string];

// Convert palette array to ThemeColorProperties object
function paletteToColorProperties(arr: PaletteColors): ThemeColorProperties {
  return {
    gradientStart: arr[0],
    gradientEnd: arr[1],
    text: arr[2],
    textSecondary: arr[3],
    border: arr[1],
    surface: arr[0],
    primary: arr[0],
    secondary: arr[3],
    background: arr[0],
    cardBackground: arr[0],
    inputBackground: arr[0],
    error: '#ff5252',
  };
}

// 1. 50 farklı güzel ve zengin gradient paleti
// 1. Özenle Seçilmiş Modern ve Şık Temalar
export const PALETTES: Record<string, PaletteColors> = {


  // Modern & Minimal (Hafif Geçişler)
  minimal: ['#F9FAFB', '#E5E7EB', '#111827', '#374151'],
  gece: ['#1F2937', '#374151', '#F9FAFB', '#E5E7EB'],

  // Canlı & Enerjik (Yumuşak Gradyanlar)
  macera: ['#FECACA', '#FCA5A5', '#7F1D1D', '#991B1B'],  // Soft Kırmızı
  gunbatimi: ['#FED7AA', '#FDBA74', '#7C2D12', '#9A3412'], // Soft Turuncu
  altin: ['#FDE68A', '#FCD34D', '#78350F', '#92400E'],     // Soft Sarı

  // Doğal & Sakin
  doga: ['#A7F3D0', '#6EE7B7', '#064E3B', '#065F46'],     // Soft Yeşil
  nane: ['#99F6E4', '#5EEAD4', '#134E4A', '#115E59'],     // Soft Mint
  okyanus: ['#BFDBFE', '#93C5FD', '#1E3A8A', '#1E40AF'],   // Soft Mavi

  // Zarif & Soylu
  kraliyet: ['#C7D2FE', '#A5B4FC', '#312E81', '#3730A3'],  // Soft İndigo
  lavanta: ['#E9D5FF', '#D8B4FE', '#581C87', '#6B21A8'],   // Soft Mor
  seker: ['#FBCFE8', '#F9A8D4', '#831843', '#9D174D'],     // Soft Pembe
  buz: ['#BAE6FD', '#7DD3FC', '#0C4A6E', '#075985'],       // Soft Açık Mavi
};

export const PALETTE_NAMES = Object.keys(PALETTES);

// Varsayılan tema
export const DEFAULT_THEME: ThemeType = 'gece';

// Tema yardımcı fonksiyonları
export const getThemeColors = (themeName: string = DEFAULT_THEME): ThemeColors => {
  const palette = PALETTES[themeName] || PALETTES['gece'];
  return palette as ThemeColors;
};

export const getThemeColorProperties = (themeName: string = DEFAULT_THEME): ThemeColorProperties => {
  const palette = PALETTES[themeName] || PALETTES['gece'];
  return paletteToColorProperties(palette);
};

export const getPrimaryColor = (themeName: string = DEFAULT_THEME): string => {
  const colors = getThemeColors(themeName);
  return colors[0]; // İlk renk primary
};

export const getSecondaryColor = (themeName: string = DEFAULT_THEME): string => {
  const colors = getThemeColors(themeName);
  return colors[3]; // Son renk secondary
};

export const getBottomBarColor = (themeName: string = DEFAULT_THEME): string => {
  const colors = getThemeColors(themeName);
  return colors[3]; // Son renk bottom bar için
};
