// HSL'den HEX'e dönüştüren yardımcı fonksiyon
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Döngüsel soft pastel palet üreten fonksiyon
function generateCyclePalette(length = 100) {
  const palette = [];
  for (let i = 0; i < length; i++) {
    const hue = (210 + (360 * i) / length) % 360;     
    const sat = 60;
    const light = 85;
    palette.push(hslToHex(hue, sat, light));
  }
  return palette;
}

// CYCLE_PALETTE veya benzeri bir palet kullanıyorsan, gradient çifti almak için yardımcı fonksiyon:
function getGradientPair(index, palette) {
  return [
    palette[index % palette.length],
    palette[(index + 1) % palette.length]
  ];
}

// 1. 50 farklı güzel ve zengin gradient paleti
export const PALETTES = {
  // Pastel Temalar
  pastel_pembe: ['#f8b195', '#f67280', '#c06c84', '#6c5b7b'],
  pastel_mavi: ['#a8e6cf', '#dcedc1', '#c7ceea', '#e2cfea'],
  pastel_mor: ['#e1bee7', '#f3e5f5', '#d1c4e9', '#c5cae9'],
  pastel_turuncu: ['#ffccbc', '#ffab91', '#ff8a65', '#ff7043'],
  pastel_yesil: ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a'],
  
  // Sıcak Temalar
  gunesli_sari: ['#fff8e1', '#ffecb3', '#ffd54f', '#ffb300'],
  gunesli_altin: ['#ffd54f', '#ffb300', '#ff8f00', '#ff6f00'],
  gunesli_turuncu: ['#ffe0b2', '#ffcc02', '#ff9800', '#f57c00'],
  gunesli_mercimek: ['#ffab91', '#ff8a65', '#ff7043', '#ff5722'],
  gunesli_koral: ['#ffcdd2', '#ef9a9a', '#e57373', '#ef5350'],
  
  // Soğuk Temalar
  gece_koyu: ['#232526', '#414345', '#434343', '#2c3e50'],
  gece_mavi: ['#2c3e50', '#34495e', '#283e51', '#485563'],
  gece_mor: ['#4a148c', '#6a1b9a', '#7b1fa2', '#8e24aa'],
  gece_lacivert: ['#1a237e', '#283593', '#303f9f', '#3949ab'],
  gece_gri: ['#424242', '#616161', '#757575', '#9e9e9e'],
  
  // Doğa Temaları
  orman_yesil: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784'],
  orman_koyu: ['#2e7d32', '#388e3c', '#43a047', '#4caf50'],
  orman_mint: ['#a5d6a7', '#81c784', '#66bb6a', '#4caf50'],
  orman_olive: ['#827717', '#9e9d24', '#afb42b', '#c0ca33'],
  orman_forest: ['#1b5e20', '#2e7d32', '#388e3c', '#43a047'],
  
  // Deniz Temaları
  deniz_mavi: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'],
  deniz_okyanus: ['#0277bd', '#0288d1', '#039be5', '#03a9f4'],
  deniz_turkuaz: ['#00acc1', '#26c6da', '#4dd0e1', '#80deea'],
  deniz_lacivert: ['#1565c0', '#1976d2', '#1e88e5', '#42a5f5'],
  deniz_aqua: ['#4dd0e1', '#26c6da', '#00bcd4', '#00acc1'],
  
  // Çiçek Temaları
  cicek_lavanta: ['#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc'],
  cicek_gul: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292'],
  cicek_orkide: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8'],
  cicek_papatya: ['#fff9c4', '#fff59d', '#fff176', '#ffee58'],
  cicek_menekse: ['#e8eaf6', '#c5cae9', '#9fa8da', '#7986cb'],
  
  // Mevsim Temaları
  ilkbahar: ['#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a'],
  yaz: ['#fff3e0', '#ffe0b2', '#ffcc02', '#ffb300'],
  sonbahar: ['#ffccbc', '#ffab91', '#ff8a65', '#ff7043'],
  kis: ['#f5f5f5', '#eeeeee', '#e0e0e0', '#bdbdbd'],
  bahar: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784'],
  
  // Özel Temalar
  romantik: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292'],
  zen: ['#f5f5f5', '#eeeeee', '#e0e0e0', '#bdbdbd'],
  vintage: ['#d7ccc8', '#bcaaa4', '#a1887f', '#8d6e63'],
  modern: ['#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0'],
  klasik: ['#e0e0e0', '#bdbdbd', '#9e9e9e', '#757575'],
  
  // Renkli Temalar
  gokkusagi: ['#e1f5fe', '#b3e5fc', '#81d4fa', '#4fc3f7'],
  neon: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8'],
  retro: ['#ffecb3', '#ffd54f', '#ffb300', '#ff8f00'],
  minimal: ['#fafafa', '#f5f5f5', '#eeeeee', '#e0e0e0'],
  elegant: ['#fce4ec', '#f8bbd9', '#f48fb1', '#f06292'],
  
  // Atmosfer Temaları
  sabah: ['#fff8e1', '#ffecb3', '#ffd54f', '#ffb300'],
  aksam: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'],
  alaca_karanlik: ['#424242', '#616161', '#757575', '#9e9e9e'],
  gunes_bati: ['#ffccbc', '#ffab91', '#ff8a65', '#ff7043'],
  ay_isi: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8'],
  
  // Duygu Temaları
  huzurlu: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784'],
  enerjik: ['#fff3e0', '#ffe0b2', '#ffcc02', '#ffb300'],
  sakin: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'],
  coskulu: ['#ffecb3', '#ffd54f', '#ffb300', '#ff8f00'],
  melankolik: ['#f5f5f5', '#eeeeee', '#e0e0e0', '#bdbdbd'],
  
  // Özel Kombinasyonlar
  pembe_mavi: ['#fce4ec', '#e3f2fd', '#bbdefb', '#90caf9'],
  yesil_mavi: ['#e8f5e8', '#e3f2fd', '#bbdefb', '#90caf9'],
  mor_pembe: ['#f3e5f5', '#fce4ec', '#f8bbd9', '#f48fb1'],
  turuncu_sari: ['#fff3e0', '#fff8e1', '#ffecb3', '#ffd54f'],
  gri_mavi: ['#f5f5f5', '#e3f2fd', '#bbdefb', '#90caf9'],
  
  // Premium Temalar
  altin_gumus: ['#fff8e1', '#f5f5f5', '#eeeeee', '#e0e0e0'],
  inci_mavi: ['#e3f2fd', '#f5f5f5', '#eeeeee', '#e0e0e0'],
  zumrut_yesil: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784'],
  yakut_kirmizi: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373'],
  safir_mavi: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6'],
};

export const PALETTE_NAMES = Object.keys(PALETTES);

// Varsayılan tema
export const DEFAULT_THEME = 'pastel_mavi';

// Tema yardımcı fonksiyonları
export const getThemeColors = (themeName = DEFAULT_THEME) => {
  return PALETTES[themeName] || PALETTES[DEFAULT_THEME];
};

export const getPrimaryColor = (themeName = DEFAULT_THEME) => {
  const colors = getThemeColors(themeName);
  return colors[0]; // İlk renk ana renk
};

export const getSecondaryColor = (themeName = DEFAULT_THEME) => {
  const colors = getThemeColors(themeName);
  return colors[3]; // İkinci renk ikincil renk
};

export const getBottomBarColor = (themeName = DEFAULT_THEME) => {
  const colors = getThemeColors(themeName);
  return colors[colors.length - 1]; // Son renk bottom bar için
}; 