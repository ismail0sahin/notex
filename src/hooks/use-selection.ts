import { useCallback, useState } from 'react';

/**
 * Uzun basınca açılan çoklu seçim.
 *
 * Ayrı bir "seçim modu" bayrağı yok: seçim boş değilse mod açıktır. Son öğenin
 * seçimi kalkınca mod kendiliğinden kapanır, tutarsız bir ara durum oluşamaz.
 */
export function useSelection() {
  const [ids, setIds] = useState<readonly number[]>([]);

  const toggle = useCallback((id: number) => {
    setIds((current) =>
      current.includes(id) ? current.filter((other) => other !== id) : [...current, id]
    );
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return {
    ids,
    count: ids.length,
    active: ids.length > 0,
    has: (id: number) => ids.includes(id),
    toggle,
    clear,
  };
}
