/**
 * Görsel tercihlerin tamamı: renkler, boşluklar, yazı boyutları, köşe
 * yarıçapları, öğe ölçüleri ve animasyon süreleri.
 *
 * Bileşenlerin içinde çıplak sayı ya da renk kodu bırakılmaz; buraya bir token
 * eklenir. Böylece bütün tasarım işi bu dosyayla `strings.ts`'te toplanıyor.
 *
 * Palet: "Kağıt" — kremli zemin. Aksan kullanıcı tercihi (`Accents`), zemin ve
 * yazı renkleri sabit; ikisi `resolveColors` ile birleşiyor.
 */

import { Platform } from 'react-native';

/**
 * Aksandan bağımsız renkler: zemin, yazı, çerçeve, uyarı.
 *
 * Dışa açılmıyor — bileşenler `useTheme()` ile çözülmüş kümeyi alır, çünkü
 * gerçek palet burayla seçili aksanın birleşimi.
 */
const Base = {
  light: {
    text: '#2A2420',
    textSecondary: '#6E645A',
    /** Kartların kenar çizgisi. Zeminle satırı ayırıp yüzeye şekil veriyor. */
    borderSubtle: '#E2D8C8',
    background: '#FBF8F3',
    backgroundElement: '#F2ECE2',
    backgroundSelected: '#E7DFD1',
    /** Silme eylemleri. */
    danger: '#B3261E',
    /** Menü açıkken içeriğin üstüne inen perde. */
    scrim: 'rgba(42, 36, 32, 0.3)',
  },
  dark: {
    text: '#F5EFE7',
    textSecondary: '#A99B8C',
    borderSubtle: '#2C2620',
    background: '#14110E',
    backgroundElement: '#201C18',
    backgroundSelected: '#2C2620',
    danger: '#F2B8B5',
    scrim: 'rgba(0, 0, 0, 0.55)',
  },
} as const;

/**
 * Kullanıcının seçtiği aksana bağlı üç renk.
 *
 * `backgroundDone` elle seçilmedi: aksanın zemine karışmış hâli (açıkta %12,
 * koyuda %22 aksan). Yeni bir aksan eklenirken aynı oranla üretilmeli, yoksa
 * tamamlanan satır ya kaybolur ya bağırır.
 */
export const Accents = {
  terracotta: {
    light: { accent: '#B95F3B', onAccent: '#FFFFFF', backgroundDone: '#F3E6DD' },
    dark: { accent: '#E08A5F', onAccent: '#14110E', backgroundDone: '#412C20' },
  },
  olive: {
    light: { accent: '#5F7A45', onAccent: '#FFFFFF', backgroundDone: '#E8E9DE' },
    dark: { accent: '#9DBE72', onAccent: '#14110E', backgroundDone: '#323724' },
  },
  indigo: {
    light: { accent: '#3F5F96', onAccent: '#FFFFFF', backgroundDone: '#E4E6E8' },
    dark: { accent: '#86A8DC', onAccent: '#14110E', backgroundDone: '#2D323B' },
  },
  plum: {
    light: { accent: '#7C4A78', onAccent: '#FFFFFF', backgroundDone: '#ECE3E4' },
    dark: { accent: '#C68FC0', onAccent: '#14110E', backgroundDone: '#3B2D35' },
  },
  teal: {
    light: { accent: '#2F6F6B', onAccent: '#FFFFFF', backgroundDone: '#E3E8E3' },
    dark: { accent: '#6FB8B2', onAccent: '#14110E', backgroundDone: '#283632' },
  },
} as const;

export type AccentName = keyof typeof Accents;

/** Paletin kurulduğu aksan; ilk açılışta ve kayıtlı değer okunamazsa bu. */
export const DEFAULT_ACCENT: AccentName = 'terracotta';

export type ThemeColor = keyof typeof Base.light | keyof (typeof Accents)[AccentName]['light'];

/** Bir temanın çözülmüş renk kümesi: zemin + aksan. */
export type ThemeColors = Record<ThemeColor, string>;

/** Kullanıcının tema tercihi. `system` cihaz ayarını izler. */
export type ThemePreference = 'system' | 'light' | 'dark';

export function resolveColors(scheme: 'light' | 'dark', accent: AccentName): ThemeColors {
  return { ...Base[scheme], ...Accents[accent][scheme] };
}

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
 * Başlıklarda kullanılan yazı tipi. Gövde, satırlar ve arayüz sistem yazı
 * tipinde kalıyor: uzun metinde ve klavye ile en güvenli olan o.
 *
 * Ad `_layout.tsx`'te `useFonts`'a verilen anahtarla birebir aynı olmalı.
 * Yükleme çalışma anında yapılıyor, native olarak gömülmüyor — gömülseydi
 * Expo Go'da font bulunamaz, geliştirmeyle gerçek derleme ayrışırdı.
 *
 * Lora'da `✓` ve `←` yok; onlar `Glyphs` üzerinden sistem yazı tipiyle
 * çiziliyor, bu yüzden sorun çıkmıyor.
 */
export const Fonts = {
  heading: 'Lora-SemiBold',
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
  /** Not gövdesi. Satır satır okunan tek yer, gövdeden biraz daha ferah. */
  reading: 28,
  title: 30,
  back: 44,
  screenTitle: 44,
  fab: 32,
} as const;

/**
 * İki ağırlık yeter: normal metin ve vurgulu metin. Başlıklar ağırlık
 * kullanmıyor, `Fonts.heading` zaten SemiBold bir dosya.
 */
export const FontWeight = {
  regular: '500',
  bold: '700',
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
  /** Renk seçim kartındaki örnek dairenin çapı. */
  swatch: 28,
  /** Büyüteç simgesinin mercek çapı; sapı buradan türüyor. */
  searchLens: 13,
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

/** Animasyon süreleri (ms). */
export const Motion = {
  /** Panellerin sağdan kayması. */
  panelOpen: 220,
  panelClose: 180,
  /** Tamamlanan satırın listedeki yeni yerine kayması. */
  rowSettle: 260,
  /** İşaretleyicideki tikin belirmesi. */
  check: 160,
} as const;

/**
 * İkon yerine kullanılan simgeler. Kelimeler `strings.ts`'te, görsel öğeler
 * burada: çöp kutusu, üç nokta ve tırtıl View'lerle çizili, bunlar ise karakter.
 */
export const Glyphs = {
  check: '✓',
  add: '+',
  back: '←',
  close: '✕',
} as const;

export const MaxContentWidth = 800;
