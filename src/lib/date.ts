import { Strings } from '@/constants/strings';

/** Yerel saate göre 'YYYY-MM-DD'. toISOString() UTC'ye kaydırdığı için kullanılmıyor. */
function toYmd(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function todayYmd() {
  return toYmd(new Date());
}

/** Not satırlarında son düzenleme tarihi için kısa etiket. */
export function formatDate(ymd: string) {
  if (ymd === todayYmd()) return Strings.today;

  const [year, month, day] = ymd.split('-').map(Number);
  const label = `${day} ${Strings.months[month - 1]}`;
  return year === new Date().getFullYear() ? label : `${label} ${year}`;
}

// --- Çizelge saatleri ---

/** 'HH:MM' metnini saat seçicisine verilecek Date'e çevirir. */
export function hmToDate(hm: string | null) {
  const date = new Date();

  if (hm) {
    const [hours, minutes] = hm.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  } else {
    date.setMinutes(0, 0, 0);
  }

  return date;
}

/** Saat seçicisinden dönen Date'i 'HH:MM' olarak saklanacak metne çevirir. */
export function dateToHm(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
}
