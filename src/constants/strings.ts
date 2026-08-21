/**
 * Arayüzde geçen bütün metinler. Bileşenlerin içinde düz yazı bırakılmaz.
 *
 * Sayı içeren cümleler fonksiyon olarak duruyor; böylece dilbilgisi de tek
 * yerde kalıyor, çağıran taraf birleştirme yapmıyor.
 */
export const Strings = {
  tabs: {
    notes: 'Notlar',
    plans: 'Planlar',
  },

  common: {
    cancel: 'Vazgeç',
    delete: 'Sil',
    done: 'Bitti',
    save: 'Kaydet',
    clearTime: 'Temizle',
  },

  notes: {
    title: 'Notlar',
    empty: 'Henüz not yok. Sağ alttaki + ile ilk notunu ekle.',
    untitled: 'Başlıksız',
    titlePlaceholder: 'Başlık',
    bodyPlaceholder: 'Not...',
    selected: (count: number) => `${count} not seçili`,
    deleteSelectedTitle: 'Seçilenleri sil',
    deleteSelectedBody: (count: number) => `${count} not kalıcı olarak silinecek.`,
  },

  plans: {
    title: 'Planlar',
    empty: 'Henüz plan yok. Sağ alttaki + ile bir plan oluştur, içine görevlerini ekle.',
    none: 'Plan yok',
    newTitle: 'Yeni plan',
    running: (count: number) => `${count} plan sürüyor`,
    selected: (count: number) => `${count} plan seçili`,
    deleteSelectedTitle: 'Seçilenleri sil',
    deleteSelectedBody: (count: number) =>
      `${count} plan ve içindeki bütün görevler kalıcı olarak silinecek.`,
    scheduleLabel: 'Çizelge',
    noTasks: 'Görev yok',
    taskProgress: (done: number, total: number) => `${done}/${total} görev tamam`,
    timeSpan: (start: string, end: string) => `${start} – ${end}`,
  },

  planDetail: {
    untitled: 'Başlıksız plan',
    namePlaceholder: 'Plan adı',
    schedulePlaceholder: 'Çizelge adı',
    addTask: 'Görev ekle',
    addScheduleRow: 'Satır ekle',
    taskPlaceholder: 'Görev',
    noTasks: 'Görev yok',
    progress: (done: number, total: number) => `${done}/${total} tamamlandı`,
    selected: (count: number) => `${count} görev seçili`,
    deleteSelectedTitle: 'Seçilenleri sil',
    deleteSelectedBody: (count: number) => `${count} görev kalıcı olarak silinecek.`,
    columnTask: 'Görev',
    columnStart: 'Başlangıç',
    columnEnd: 'Bitiş',
    emptyTime: '--:--',
  },

  planTypes: {
    question: 'Nasıl bir plan?',
    checklistTitle: 'Görev listesi',
    checklistDescription: 'Alt alta görevler, tik atarak tamamla. Saat yok.',
    scheduleTitle: 'Çizelge',
    scheduleDescription: 'Her satırın başlangıç ve bitiş saati olur. Günü saatlere böl.',
  },

  modes: {
    reorder: 'Sırala',
    reorderDescription: 'Basılı tutup taşı',
    select: 'Seç',
    selectDescription: 'Çoklu seçip sil',
    reorderHintList: 'Taşımak için satırı basılı tutup sürükle',
    reorderHintShort: 'Basılı tutup sürükle',
  },

  months: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  today: 'Bugün',
  tomorrow: 'Yarın',

  /** Ekran okuyucu etiketleri. */
  a11y: {
    add: 'Yeni ekle',
    deleteSelected: 'Seçilenleri sil',
    listMenu: 'Liste menüsü',
    back: 'Geri',
    startTime: 'Başlangıç saati',
    endTime: 'Bitiş saati',
  },
} as const;
