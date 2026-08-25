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
    clearTime: 'Temizle',
  },

  notes: {
    title: 'Notlar',
    empty: 'Henüz not yok. Sağ alttaki + ile ilk notunu ekle.',
    untitled: 'Başlıksız',
    titlePlaceholder: 'Başlık',
    bodyPlaceholder: 'Not...',
    count: (count: number) => (count === 1 ? '1 not' : `${count} not`),
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
    sortedLabel: 'Bitenler altta',
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
    sortedTitle: 'Alışveriş listesi',
    sortedDescription: 'Tiklenen satır alta iner, yapılacaklar üstte kalır.',
  },

  hidden: {
    title: 'Gizli notlar',
    menuDescription: 'Desenle açılır',
    empty: 'Burada not yok. Ana listeden not seçip "Gizle" ile buraya taşıyabilirsin.',
    count: (count: number) => (count === 1 ? '1 gizli not' : `${count} gizli not`),
    hide: 'Gizle',
    unhide: 'Göster',
    changePattern: 'Deseni değiştir',
    changePatternDescription: 'Yeni bir desen çiz',
  },

  pattern: {
    create: 'Gizli notlar için bir desen çiz',
    confirm: 'Deseni bir daha çiz',
    verify: 'Deseni çiz',
    tooShort: (min: number) => `En az ${min} nokta birleştir`,
    mismatch: 'Desenler aynı değil, baştan çiz',
    wrong: 'Desen yanlış',
    notEncrypted: 'Desen notları gizler, şifrelemez.',
  },

  appearance: {
    title: 'Görünüm',
    system: 'Sistem',
    systemDescription: 'Cihazın ayarını izler',
    light: 'Açık',
    lightDescription: 'Her zaman açık tema',
    dark: 'Koyu',
    darkDescription: 'Her zaman koyu tema',
  },

  accent: {
    title: 'Renk',
    description: 'İşaretleyici ve düğme rengi',
    terracotta: 'Kiremit',
    olive: 'Zeytin',
    indigo: 'Mürekkep',
    plum: 'Erik',
    teal: 'Deniz',
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
