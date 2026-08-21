import { Strings } from '@/constants/strings';

/** Başlık boş bırakıldığında notun başından alınacak en fazla karakter. */
const DERIVED_TITLE_LIMIT = 60;

/**
 * Liste satırında gösterilecek başlık ve önizleme.
 *
 * Başlık boşsa notun ilk satırı başlık yerine geçer, kalanı önizleme olur.
 * Böylece aynı metin iki kez görünmüyor. Başlık veritabanında boş kalıyor —
 * türetilmiş metni kaydetmek, kullanıcı notu düzenlediğinde eskiyecek bir
 * kopya bırakırdı.
 */
export function notePreview(note: { title: string; body: string }) {
  if (note.title) {
    return { title: note.title, preview: note.body };
  }

  const [firstLine, ...rest] = note.body.split('\n');
  const derived = firstLine.trim().slice(0, DERIVED_TITLE_LIMIT);

  return {
    title: derived || Strings.notes.untitled,
    preview: rest.join('\n').trim(),
  };
}
