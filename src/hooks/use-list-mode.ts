import { useCallback, useState } from 'react';

export type ListMode = 'normal' | 'select' | 'reorder';

/**
 * Listelerin üç durumu tek yerde.
 *
 * Uzun basış moda göre farklı iş yapıyor: normalde çoklu seçimi başlatır,
 * sıralama modunda sürüklemeyi. Aynı hareketin iki anlamı olduğu için hangi
 * modda olunduğunun tek bir kaynaktan okunması gerekiyor.
 */
export function useListMode() {
  const [mode, setMode] = useState<ListMode>('normal');
  const [ids, setIds] = useState<readonly number[]>([]);

  const reset = useCallback(() => {
    setMode('normal');
    setIds([]);
  }, []);

  /** id verilirse o satır seçili olarak açılır (uzun basış yolu). */
  const startSelect = useCallback((id?: number) => {
    setMode('select');
    setIds(id === undefined ? [] : [id]);
  }, []);

  const startReorder = useCallback(() => {
    setMode('reorder');
    setIds([]);
  }, []);

  const toggle = useCallback((id: number) => {
    setIds((current) =>
      current.includes(id) ? current.filter((other) => other !== id) : [...current, id]
    );
  }, []);

  return {
    mode,
    ids,
    count: ids.length,
    selecting: mode === 'select',
    reordering: mode === 'reorder',
    has: (id: number) => ids.includes(id),
    startSelect,
    startReorder,
    toggle,
    reset,
  };
}
