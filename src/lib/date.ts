const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** Yerel saate göre 'YYYY-MM-DD'. toISOString() UTC'ye kaydırdığı için kullanılmıyor. */
export function toYmd(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayYmd() {
  return toYmd(new Date());
}

export function tomorrowYmd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toYmd(d);
}

/** Liste satırlarında gösterilen kısa etiket. */
export function formatDue(ymd: string | null) {
  if (!ymd) return null;
  if (ymd === todayYmd()) return 'Bugün';
  if (ymd === tomorrowYmd()) return 'Yarın';

  const [year, month, day] = ymd.split('-').map(Number);
  const label = `${day} ${MONTHS[month - 1]}`;
  return year === new Date().getFullYear() ? label : `${label} ${year}`;
}

/** Tarihi geçmiş ve bitmemiş planları vurgulamak için. */
export function isOverdue(ymd: string | null) {
  return ymd !== null && ymd < todayYmd();
}
