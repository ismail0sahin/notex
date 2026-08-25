/**
 * Arama eşleşmesi.
 *
 * Süzme SQL'de değil burada yapılıyor: SQLite'ın `LIKE` ve `lower()`'ı yalnızca
 * ASCII biliyor, "İstanbul" ile "istanbul" eşleşmiyor. Liste birkaç yüz satır,
 * JS'te süzmenin maliyeti yok.
 */

/** Türkçe işaretlerin ASCII karşılığı. */
const FOLD: Record<string, string> = {
  ğ: 'g',
  ü: 'u',
  ş: 's',
  ı: 'i',
  ö: 'o',
  ç: 'c',
  â: 'a',
  î: 'i',
  û: 'u',
};

/**
 * Küçük harfe indirir ve işaretleri düşürür: "Süt" ile "sut" aynı olur.
 *
 * Küçültme Türkçe kurallarıyla: 'I' → 'ı', 'İ' → 'i'. İkisi de sonra 'i'ye
 * katlanıyor, böylece hangi i yazıldığının önemi kalmıyor — telefonda İngilizce
 * klavyeyle arama yapmak da işe yarıyor.
 */
export function fold(text: string) {
  return text.toLocaleLowerCase('tr').replace(/[ğüşıöçâîû]/g, (char) => FOLD[char]);
}

export function matches(text: string, query: string) {
  return fold(text).includes(fold(query));
}
