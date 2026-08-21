import * as Crypto from 'expo-crypto';

/** Android'in desen kilidi gibi: en az bu kadar nokta birleştirilmeli. */
export const MIN_PATTERN_LENGTH = 4;

/** `settings` tablosundaki anahtar. */
export const PATTERN_KEY = 'hidden_pattern';

/**
 * Desen düz metin saklanmıyor; SHA-256 özeti tutuluyor.
 *
 * Bu şifreleme değil — notların kendisi aynı dosyada düz metin duruyor.
 * Hash yalnızca deseni koruyor, çünkü kullanıcı aynı deseni başka yerlerde de
 * kullanıyor olabilir.
 */
export function hashPattern(dots: readonly number[]) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `notex:${dots.join('-')}`);
}
