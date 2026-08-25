import * as Haptics from 'expo-haptics';

/**
 * Dokunsal geri bildirim. Uygulamada `expo-haptics` doğrudan çağrılmaz; hangi
 * hareketin ne kadar titreteceği burada tek yerde duruyor.
 *
 * Hepsi ateşle-unut: titreşim gecikirse arayüz beklemesin, cihaz motoru yoksa
 * ya da kullanıcı sistem ayarından kapattıysa hata sessizce yutuluyor.
 */
function fire(style: Haptics.ImpactFeedbackStyle) {
  Haptics.impactAsync(style).catch(() => {});
}

/** Bir öğe tamamlandı ya da tamamlanmışlığı geri alındı. */
export function tapped() {
  fire(Haptics.ImpactFeedbackStyle.Light);
}

/** Uzun basış bir moda girdi: çoklu seçim açıldı ya da sürükleme başladı. */
export function held() {
  fire(Haptics.ImpactFeedbackStyle.Medium);
}
