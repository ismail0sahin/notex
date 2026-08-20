/**
 * Uygulamanın bütün renkleri ve boşlukları burada. Ekranlarda ham renk kodu
 * yazılmaz; palet değiştirmek gerektiğinde tek dosya yeter.
 *
 * Palet: "Kağıt" — kremli zemin, toprak tonu aksan.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A2420',
    textSecondary: '#6E645A',
    background: '#FBF8F3',
    backgroundElement: '#F2ECE2',
    backgroundSelected: '#E7DFD1',
    /** İşaretleyici, + düğmesi, ilerleme çubuğu. */
    accent: '#B95F3B',
    /** Aksan zemin üzerine gelen yazı ve simge rengi. */
    onAccent: '#FFFFFF',
    /** Tarihi geçmiş planlar, silme eylemleri. */
    danger: '#B3261E',
  },
  dark: {
    text: '#F5EFE7',
    textSecondary: '#A99B8C',
    background: '#14110E',
    backgroundElement: '#201C18',
    backgroundSelected: '#2C2620',
    accent: '#E08A5F',
    onAccent: '#14110E',
    danger: '#F2B8B5',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Sekme çubuğunun yüksekliği. Ekranlar çubuğun arkasına kadar uzadığı için
 * sabitlenmiş öğeler (+ düğmesi) ve liste alt boşlukları bu kadar yukarı alınır.
 * Cihazın alt çentik/gezinme boşluğu SafeAreaView tarafından ayrıca eklenir.
 */
export const TabBarHeight = Platform.select({ ios: 72, android: 104 }) ?? 104;

/** + düğmesinin çapı; listelerin altında bu kadar yer bırakılır ki son satır altında kalmasın. */
export const FabSize = 56;

export const MaxContentWidth = 800;
