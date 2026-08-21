# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

# Notex

Çevrimdışı çalışan not ve plan uygulaması. Hedef platform Android. Sunucu, hesap,
senkronizasyon yok — bütün veri cihazdaki SQLite dosyasında (`notex.db`).
Arayüz metinleri Türkçe.

## Yapı

- `src/db/index.ts` — şema, migration ve bütün sorgular. Şema değişince
  `DATABASE_VERSION` artırılır ve `migrateDbIfNeeded` içine yeni bir
  `if (currentDbVersion === n)` bloğu eklenir. Var olan blok düzenlenmez,
  yoksa kurulu uygulamalardaki veri bozulur.
- `src/app/_layout.tsx` — `SQLiteProvider` burada; ekranlar `useSQLiteContext()` kullanır.
- `src/app/index.tsx` — Notlar sekmesi. `src/app/plans.tsx` — Planlar sekmesi (plan listesi).
- `src/components/plan-detail.tsx` — bir planın içi: başlık, tarih, görev checklist'i.
  Görev metni normalde düz yazıdır, dokununca yalnızca o satır `TextInput`'e döner.
  Bu bilinçli: sürekli açık bir `TextInput` olsaydı uzun basış Android'in metin
  seçme menüsüne gider, çoklu seçim hiç tetiklenmezdi. Geri çevirmeyin.
  Plan bir kapsayıcıdır; tamamlanma durumu `tasks` satırlarından hesaplanır, `plans`
  tablosunda tutulmaz. Detay ekranındaki değişiklikler anında kaydedilir, Kaydet düğmesi yok.
- Ekran geçişleri `Modal` ile yapılıyor, ayrı route açılmıyor — `NativeTabs` altında
  sekme olmayan route'lar sorun çıkarıyor.
- `src/components/slide-panel.tsx` — not ve plan sayfalarını sağdan kaydırarak açar.
  `Modal`'ın `animationType="slide"`'ı Android'de alttan getiriyor, o yüzden geçiş
  Reanimated ile elle yazıldı. Çıkış animasyonu görünsün diye Modal, animasyon
  bitene kadar `mounted` ile ayakta tutuluyor; bu kaldırılırsa panel çıkışta
  aniden yok olur.
- `plans.due_date` kolonu duruyor ama arayüzde kullanılmıyor. Bugün/Yarın/Tarihsiz
  düğmeleri kaldırıldı; yeni planlar `null` tarihle açılıyor. Tarih geri istenirse
  `@react-native-community/datetimepicker` zaten kurulu, `mode="date"` ile gerçek
  bir tarih seçici bağlanabilir.
- `src/components/app-tabs.tsx` — sekmeler (`NativeTabs`). Sekme adı dosya adıyla eşleşmeli.
- `src/hooks/use-list-mode.ts` — listelerin üç durumu: `normal`, `select`, `reorder`.
  Uzun basış moda göre farklı iş yapıyor (normalde seçim açar, sıralamada sürükler),
  o yüzden mod tek kaynaktan okunur. Yeni bir listeye bu davranış eklenecekse bu
  hook kullanılır, ikinci bir durum değişkeni açılmaz.
- `src/components/{note,plan,task}-row.tsx` — satırlar ayrı bileşen olmak **zorunda**:
  `useReorderableDrag()` bir hook, `renderItem` gövdesinde çağrılamaz.
- Satır aralığı listenin `contentContainerStyle` `gap`'inde değil, satırın kendi
  `marginBottom`'unda. Sürüklenen hücrenin yüksekliği hesaplanırken kap boşluğu
  hesaba girmiyor; `gap` kullanılırsa sürükleme kayıyor.
- `PlanDetail` bir `Modal` içinde çalışıyor ve kendi `GestureHandlerRootView`'ini
  sarıyor. Modal içindeki hareketler kök görünüm olmadan çalışmaz.
- `src/lib/date.ts` — `YYYY-MM-DD` yerel tarih yardımcıları. `toISOString()` UTC'ye
  kaydırdığı için tarih üretmede kullanılmaz.
- `src/constants/` bütün arayüz tercihlerinin tek adresi. Kural: **kelimeler
  `strings.ts`'te, görsel her şey `theme.ts`'te.** Bileşenlerin içinde düz metin,
  renk kodu ya da çıplak ölçü bırakılmaz; oraya token eklenir.
  - `strings.ts` — ekranda geçen her kelime. Sayı içeren cümleler fonksiyon
    (`Strings.notes.selected(3)`), böylece dilbilgisi de tek yerde kalıyor.
  - `theme.ts` — `Colors`, `Spacing`, `FontSize`, `LineHeight`, `FontWeight`,
    `Radius`, `Sizes`, `Motion`, `Glyphs`, `TabBarHeight`, `MaxContentWidth`.
- Tamamlanan öğede yazı değişmez, **kutucuğun zemini** değişir:
  `Colors.backgroundDone` (aksanın zemine karışmış hâli). Üstünü çizmek metni
  okunmaz yapıyordu, yazıyı soluklaştırmak da yetersiz kalıyordu.
- Bütün kartların duran hâlinde `Colors.borderSubtle` çerçevesi var; seçilince
  `accent`'e dönüyor. Çerçeve her zaman duruyor (eskiden şeffaftı), yoksa seçim
  anında satır yükseklikleri oynuyor.
- Sekme ikonları `NativeTabs` tarafından boyanmıyor — renk PNG'nin içinde. Bu
  yüzden her ikon iki dosya: `notes.png` (seçili değil, ılık gri) ve
  `notes-on.png` (seçili, aksan). Tek siyah maske kullanılırsa koyu temada
  kayboluyor; template'ten gelen `renderingMode="template"` SDK 54'te yok.
- Hedef yalnızca Android: web desteği (`react-native-web`, `react-dom`, `.web.tsx`
  dosyaları, `app.json`'daki `web` bloğu, favicon) kaldırıldı. Web geri istenirse
  bunların hepsi yeniden eklenmeli.
- Silme tek yoldan: `⋮` → Seç → çöp kutusu. Not ve plan panellerinin içinde silme
  düğmesi yok, satır başına ✕ yok. Görev metnini boşaltıp çıkmak o satırı siler.

## Sürüm

Expo SDK 54 (React Native 0.81) kullanılıyor. Proje SDK 57 template'iyle kuruldu,
sonra bilinçli olarak 54'e indirildi ve 54'te kalmaya karar verildi.

Tarihsel not, yanlış teşhisin tekrarlanmaması için: 54'e inişin gerekçesi
"Android'de ş/ğ gibi harfler yazılamıyor" sorunuydu. Bu teşhis yanlıştı. Sorun
Android emülatörünün bilgisayar klavyesini keycode olarak taşımasından
kaynaklanıyor — bu harflerin Android keycode'u yok, tuş uygulamaya hiç ulaşmıyor.
Gerçek telefonda her iki SDK'da da sorunsuz çalışıyor. Emülatörde test ederken
"Enable keyboard input" kapatılıp cihazın ekran klavyesi kullanılmalı.

Template 57 için yazılmıştı; 54'e uyum için şu dosyalara yama atıldı:
`_layout.tsx` (tema `@react-navigation/native`'den), `app-tabs.tsx` (`<Label>`/`<Icon>`
modülden import edilir, `NativeTabs.Trigger.Label` yok), `use-theme.ts` ve
`app-tabs.web.tsx` (`useColorScheme` null döner, `'unspecified'` dönmez),
`animated-icon.tsx` (`absoluteFillObject`). SDK yükseltilirse bunlar gözden geçirilmeli.

Test: Play Store'daki Expo Go SDK 57'ye göredir, bu projeyi açmaz. Telefonda
Expo Go **54.0.8** elle kurulu ve Play Store otomatik güncellemesi kapalı olmalı:
`https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk`

`eas.json`'daki `development` profili `expo-dev-client` paketini ister; o paket
kaldırıldı (kurulu olması `npm start`'ı Expo Go yerine geliştirme derlemesi moduna
çeviriyor). Geliştirme derlemesine dönülürse paket yeniden kurulmalı.

## Plan türleri

`plans.kind` üç değer alır: `checklist`, `sorted` ve `schedule`.

`sorted` planlarda tamamlanan satırlar alta iner (`listTasks`'in `sinkDone`
parametresi, sıralama SQL'de) ve iki grubun arasına kenardan kenara bir çizgi
çiziliyor.
Çizgi sıralama modunda gizleniyor: sürüklenen hücrenin içinde kalıp satırla
birlikte oynuyordu. Her grubun içinde elle verilen `position` sırası
korunuyor, yani sürükleme yapılacaklar grubunun içinde hâlâ anlamlı.

Not: `notes.title` boş kalabilir. Liste satırındaki başlık `src/lib/note.ts`
içinde notun ilk satırından türetiliyor; türetilmiş metin veritabanına
yazılmıyor, yoksa not düzenlendiğinde eskiyen bir kopya kalırdı. Çizelgede her satırın
`start_time` / `end_time` alanı olabilir (`'HH:MM'` metni ya da null); görev
listesinde bu alanlar boş kalır. Tek tablo, nullable kolonlar — iki ayrı görev
tablosu tutmanın karşılığı yok.

Saat girişi `@react-native-community/datetimepicker` ile Android'in kendi
seçicisini `display="spinner"` olarak açıyor — alarm uygulamalarındaki gibi yukarı
aşağı dönen saat/dakika tekerleği. Elle "09:30" yazdırmak telefonda hataya davetiye; ayrıca
seçicinin `neutralButton`'u "Temizle" olarak bağlı, yani girilen saat geri alınabilir.

Çizelge satırları saate göre otomatik sıralanmıyor, `position` sırasında kalıyor.
Otomatik sıralama elle taşımayla çatışıyor (aşağıdaki bölüm). Bu bilinçli bir
tercih; değiştirilecekse sürüklemenin o tür için ne anlama geldiği yeniden düşünülmeli.

## Sıralama

`notes`, `plans` ve `tasks` tablolarında `position` kolonu var; listeler
`ORDER BY position` ile okunuyor. Otomatik sıralama (tamamlananları alta almak,
tarihe göre dizmek) kaldırıldı — elle taşınan bir sırayla bir arada çalışmıyor,
kullanıcı bir satırı taşıdıktan sonra geri zıplıyordu.

Yeni kayıt eklerken `position` sorgunun içinde hesaplanıyor: not, plan ve görev
için `MIN(position) - 1` (başa). Böylece ekleme sırasında bütün satırların
yeniden numaralanması gerekmiyor. Görevlerde başa eklemenin sebebi arayüz: yazma
satırı plan içinde en üstte sabit duruyor, yazılan satırın onun hemen altında
görünmesi gerekiyor.

Sürükleme bittiğinde `writePositions` sırayı 0..n-1 olarak tek işlemde yazıyor.

## Görseller

İkonlar ve açılış ekranı görseli elle çizilmedi, `scripts/make-icons.py` ile üretiliyor —
bağımlılıksız bir SDF rasterleştirici (PIL gerekmez). Marka, script'in başındaki `MARK`
listesinde kapsül (yuvarlak uçlu kalın çizgi) olarak tanımlı: iki not satırı + onay işareti.
Değiştirmek için `MARK` veya renkleri düzenle, sonra proje kökünde çalıştır:

    python scripts/make-icons.py

Ürettiği dosyalar `assets/images/` altına yazılır: `icon.png`, `android-icon-{background,
foreground,monochrome}.png`, `splash-icon.png`. Uyarlanabilir ikonun ön plan
katmanı bilinçli olarak küçük (%44) — launcher bu katmanı kırpıp ölçekliyor.

Açılış ekranı `expo-splash-screen` ile; zemin renkleri `app.json`'da (açık krem, koyu tema
için koyu kahve). Native açılış ekranı `_layout.tsx` içindeki `SplashGate` ile kapatılıyor —
veritabanı hazır olduğu an, yoksa arada boş bir kare görünüyor.

Template'in Expo markalı animasyonlu açılış katmanı ve kullanılmayan bileşenleri kaldırıldı;
`expo-image`, `expo-symbols`, `expo-web-browser` bağımlılıkları da onlarla birlikte gitti.

## Kontroller

- `npx tsc --noEmit` — tip kontrolü
- `npx expo export --platform android` — bundle gerçekten derleniyor mu (dist/ silinebilir)
- `npm start` — Expo Go ile telefonda test
