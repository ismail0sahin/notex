/**
 * Görsel tercihlerin tamamı: renkler, boşluklar, yazı boyutları, köşe
 * yarıçapları, öğe ölçüleri ve animasyon süreleri.
 *
 * Bileşenlerin içinde çıplak sayı ya da renk kodu bırakılmaz; buraya bir token
 * eklenir. Böylece bütün tasarım işi bu dosyayla `strings.ts`'te toplanıyor.
 *
 * Palet: "Kağıt" — kremli zemin, toprak tonu aksan.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#2A2420',
    textSecondary: '#6E645A',
    /** Tamamlanan satırın zemini: aksanın zemine karışmış hâli. */
    backgroundDone: '#F3E6DD',
    /** Kartların kenar çizgisi. Zeminle satırı ayırıp yüzeye şekil veriyor. */
    borderSubtle: '#E2D8C8',
    background: '#FBF8F3',
    backgroundElement: '#F2ECE2',
    backgroundSelected: '#E7DFD1',
    /** İşaretleyici, + düğmesi, ilerleme çubuğu, seçili satır çerçevesi. */
    accent: '#B95F3B',
    /** Aksan ya da uyarı zemini üzerine gelen yazı ve simge rengi. */
    onAccent: '#FFFFFF',
    /** Silme eylemleri. */
    danger: '#B3261E',
    /** Menü açıkken içeriğin üstüne inen perde. */
    scrim: 'rgba(42, 36, 32, 0.3)',
  },
  dark: {
    text: '#F5EFE7',
    textSecondary: '#A99B8C',
    backgroundDone: '#3D2C23',
    borderSubtle: '#2C2620',
    background: '#14110E',
    backgroundElement: '#201C18',
    backgroundSelected: '#2C2620',
    accent: '#E08A5F',
    onAccent: '#14110E',
    danger: '#F2B8B5',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Tek bir temanın renk kümesi. Colors `as const` olduğu için iki temanın
 *  birebir tipleri farklı; ortak arayüz bu. */
export type ThemeColors = Record<ThemeColor, string>;

/** Kullanıcının tema tercihi. `system` cihaz ayarını izler. */
export type ThemePreference = 'system' | 'light' | 'dark';

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    mono: 'monospace',
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

export const FontSize = {
  /** Yardımcı metin, sütun başlıkları, sayaçlar. */
  small: 14,
  /** Gövde metni, görev ve not satırları. */
  body: 16,
  /** Panel başlıkları — plan adı, not başlığı. */
  title: 24,
  /** Sekme başlıkları — "Notlar", "Planlar". */
  screenTitle: 32,
  /** + düğmesindeki artı. */
  fab: 28,
  /** Geri okundaki ← işareti. */
  back: 36,
  /** İşaretleyicinin içindeki tik. */
  check: 14,
} as const;

export const LineHeight = {
  small: 20,
  body: 24,
  title: 30,
  back: 44,
  screenTitle: 44,
  fab: 32,
} as const;

/** İki ağırlık yeter: normal metin ve vurgulu metin. */
export const FontWeight = {
  regular: '500',
  bold: '700',
  /** Başlıklar ve büyük yazılar. */
  heading: '600',
} as const;

export const Radius = {
  /** Saat hücreleri gibi küçük dokunma alanları. */
  small: 8,
  /** Satırlar, kartlar, menü. */
  medium: 16,
  /** Kapsül biçimli düğmeler. */
  large: 24,
} as const;

export const Sizes = {
  checkbox: 24,
  checkboxBorder: 2,
  /** Sağ alttaki yuvarlak düğmenin çapı. */
  fab: 56,
  /** Çizelgedeki saat sütununun en az genişliği. */
  timeCell: 48,
  /** Çöp kutusu, üç nokta ve tırtıl gibi çizilen simgelerin çizgi kalınlığı. */
  glyphStroke: 2,
  /** Seçili satırı belli eden çerçeve. Seçilmeyen satırlarda da şeffaf durur,
   *  yoksa seçim anında satır yükseklikleri oynuyor. */
  selectionBorder: 2,
  /** İlerleme çubuğu. */
  progressBar: 4,
  /** Yapılacaklarla bitenleri ayıran çizgi. */
  divider: 2,
  /** Desen kilidindeki noktaların çapı. */
  patternDot: 22,
  /** Başlık altındaki ince ayrım çizgisi. */
  hairline: 1,
} as const;

/**
 * Sekme çubuğunun kendi yüksekliği — cihazın gezinme boşluğu HARİÇ.
 *
 * Ekranlar çubuğun arkasına kadar uzanıyor. Sabitlenmiş öğeler (+ düğmesi) ve
 * liste alt boşlukları `useSafeAreaInsets().bottom + TabBarHeight` kadar yukarı
 * alınır. Boşluk `SafeAreaView`'e bırakılmıyor: sekmeli ekranlarda alt kenarı
 * bazen çubuk tükettiği için ne kadar eklendiği belirsiz kalıyordu, o yüzden
 * ekranlar `edges` ile alt kenarı kapatıp hesabı açıkça yapıyor.
 */
export const TabBarHeight = Platform.select({ ios: 49, android: 80 }) ?? 80;

/** Panellerin sağdan kayma süreleri (ms). */
export const Motion = {
  panelOpen: 220,
  panelClose: 180,
} as const;

/**
 * İkon yerine kullanılan simgeler. Kelimeler `strings.ts`'te, görsel öğeler
 * burada: çöp kutusu, üç nokta ve tırtıl View'lerle çizili, bunlar ise karakter.
 */
export const Glyphs = {
  check: '✓',
  add: '+',
  back: '←',
} as const;

export const MaxContentWidth = 800;
