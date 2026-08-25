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
  Onun içinde `AppThemeProvider` (`src/hooks/use-theme.tsx`) var: tema tercihini
  ve aksan rengini `settings` tablosundan okuyup uygulamaya dağıtıyor. Sıra
  önemli — sağlayıcı tercihleri veritabanından okuduğu için `SQLiteProvider`'ın
  içinde olmak zorunda. Bileşenler renk için `useTheme()`, tercihleri
  okumak/değiştirmek için `useThemePreference()` / `useAccentPreference()`
  kullanır; `useColorScheme()` doğrudan çağrılmaz, yoksa kullanıcının seçimi
  atlanır.
- `src/components/option-sheet.tsx` — ortada açılan seçim sayfası. Plan türü,
  görünüm ve aksan rengi üçü de bunu kullanıyor; yeni bir seçim gerekirse
  dördüncü bir sayfa yazmak yerine buna bir çağrı eklenir. `description` isteğe
  bağlı, `swatch` verilirse kartın sağına o renkte bir daire çizilir.
- Tema tercihi native açılış ekranını etkilemez: `app.json`'daki açılış renkleri
  cihaz ayarını izler, SQLite'taki tercihi okuyamaz. Cihaz açık temadayken
  uygulamayı koyuya sabitlerseniz açılışta krem bir kare görünür.
- `src/app/index.tsx` — Notlar sekmesi. Yalnızca `NotesList`'i ve gizli notlar
  panelini bağlıyor. `src/app/plans.tsx` — Planlar sekmesi (plan listesi).
- `src/components/notes-list.tsx` — not listesinin tamamı. `hidden` prop'u hem
  hangi kümenin okunduğunu (`notes.hidden`) hem seçim modundaki eylemin
  gizlemek mi göstermek mi olduğunu belirliyor. Ana liste ve gizli liste aynı
  bileşen; ikinci bir kopya çıkarılmaz.
- Gizli notlar `PatternGate` ile korunuyor. Desen `settings` tablosunda SHA-256
  özeti olarak duruyor (`src/lib/pattern.ts`), düz metin değil. **Bu şifreleme
  değil** — notlar aynı dosyada düz metin. Hash yalnızca desenin kendisini
  koruyor. Panel her kapanışta kilitleniyor: `unlocked` durumu `index.tsx`'te
  sıfırlanıyor.
- `PatternLock` hareketi `PanResponder` ile yazıldı, gesture-handler ile değil:
  bileşen `Modal` içinde çalışıyor ve PanResponder orada ek kök görünüm istemiyor.
  Gizli listedeki sürükleme ise gesture-handler kullandığı için panel
  `GestureHandlerRootView` ile sarılı.
- `src/components/plan-detail.tsx` — bir planın içi: başlık, tarih, görev checklist'i.
  Görev metni normalde düz yazıdır, dokununca yalnızca o satır `TextInput`'e döner.
  Bu bilinçli: sürekli açık bir `TextInput` olsaydı uzun basış Android'in metin
  seçme menüsüne gider, çoklu seçim hiç tetiklenmezdi. Geri çevirmeyin.
  Plan bir kapsayıcıdır; tamamlanma durumu `tasks` satırlarından hesaplanır, `plans`
  tablosunda tutulmaz. Hiçbir yerde Kaydet düğmesi yok: plan içindeki değişiklikler
  anında yazılıyor, notta ise geri dönmek kaydetmek demek.
- Panelleri cihazın geri tuşu `SlidePanel`'in `onRequestClose`'undan kapatıyor,
  yani kapanış paneli açan ekranda tetikleniyor. Bu yüzden "çıkarken kaydet"
  yalnızca o ekranın elindeki veriler için güvenilir: notta `save()` iki yola da
  bağlı, plan başlığı ise yazıldıkça kaydediliyor.
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
- Arama `src/lib/search.ts` üzerinden ve **SQL'de değil JS'te**: SQLite'ın
  `LIKE`/`lower()`'ı yalnızca ASCII biliyor, "İstanbul" ile "istanbul"
  eşleşmiyor. `fold()` Türkçe kurallarıyla küçültüp işaretleri düşürüyor
  ('I'→'ı', 'İ'→'i', ikisi de 'i'), böylece "sut" da "Süt"ü buluyor. Liste
  birkaç yüz satır, süzmenin maliyeti yok.
- Arama açıkken ⋮ gizleniyor, yani **sıralama moduna girilemiyor**. Bu kasıtlı:
  `writePositions` yalnızca görünen satırları 0..n-1 diye yazar, süzülmüş bir
  listede sıralamak gizli kalan satırların sırasını bozardı. Uzun basışla seçim
  ise açık — süzülmüş listeden silmek güvenli, `deleteNotes` id ile çalışıyor.
- Arama alanı da kontrolsüz: `value` geri yazılmıyor, metin yalnızca süzme için
  state'e yansıyor. Diğer bütün alanlarla aynı sebep — Android klavyesi.
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
  - `theme.ts` — `Accents`, `resolveColors`, `Fonts`, `Spacing`, `FontSize`,
    `LineHeight`, `FontWeight`, `Radius`, `Sizes`, `Motion`, `Glyphs`,
    `TabBarHeight`, `MaxContentWidth`.
- Renk iki parçadan kuruluyor: `Base` (zemin, yazı, çerçeve — dışa açılmıyor) ve
  kullanıcının seçtiği `Accents[ad]`. `resolveColors(scheme, accent)` ikisini
  birleştiriyor, `useTheme()` sonucu döndürüyor. Bileşenler bu ayrımı görmez.
  Yeni aksan eklerken `backgroundDone` elle seçilmez: aksanın zemine karışmış
  hâli (açıkta %12, koyuda %22), yoksa tamamlanan satır ya kaybolur ya bağırır.
- Tamamlanan öğede yazı değişmez, **kutucuğun zemini** değişir: `backgroundDone`.
  Üstünü çizmek metni okunmaz yapıyordu, yazıyı soluklaştırmak da yetersizdi.
- Bütün kartların duran hâlinde `borderSubtle` çerçevesi var; seçilince
  `accent`'e dönüyor. Çerçeve her zaman duruyor (eskiden şeffaftı), yoksa seçim
  anında satır yükseklikleri oynuyor.
- Dokunsal geri bildirim `src/lib/haptics.ts` üzerinden: `tapped()` (işaretleyici)
  ve `held()` (uzun basış — seçim ya da sürükleme başlangıcı). `expo-haptics`
  bileşenlerin içinden doğrudan çağrılmaz, hangi hareketin ne kadar titreteceği
  tek yerde durur. Çağrılar ateşle-unut: cihazda motor yoksa hata yutuluyor.
- Listelerde satır hareketi `ReorderableList`'in `itemLayoutAnimation`'ıyla
  (`LinearTransition`, `Motion.rowSettle`). **Sıralama modunda kapatılıyor** —
  kütüphanenin kendi sürükleme animasyonuyla aynı anda çalışınca satır iki kez
  oynuyor. `sorted` planlarda tiklenen satırın alta inişini bu animasyon
  taşıyor; notlarda ve planlarda silinen satırın boşluğunu kapatıyor.
- Sekme ikonları tek renkli maske; renk `NativeTabs`'in `iconColor={{default,
  selected}}` prop'undan geliyor, etiket rengi de `labelStyle={{default,
  selected}}`'dan. İkisi de temanın `textSecondary` / `accent` / `text`
  tonlarını kullanıyor, dolayısıyla koyu temada kendiliğinden açılıyor.
- Başlıklar Lora SemiBold (`Fonts.heading`), gövde ve arayüz sistem yazı
  tipinde. Font **çalışma anında** yükleniyor (`useFonts`, `_layout.tsx`),
  `expo-font` eklentisiyle native olarak gömülmüyor: gömülseydi Expo Go'da
  bulunamaz, geliştirmeyle gerçek derleme sekme ikonlarındaki gibi ayrışırdı.
  Yüklenene kadar hiçbir şey render edilmiyor, açılış ekranı zaten duruyor.
  Lora'da `✓` ve `←` yok — onlar `Glyphs` üzerinden sistem yazı tipiyle
  çiziliyor, o yüzden sorun çıkmıyor. `assets/fonts/OFL.txt` lisans gereği
  fontun yanında duruyor.
- Başlıklara `fontWeight` verilmiyor: dosya zaten SemiBold, üstüne ağırlık
  istemek Android'de sahte kalınlaştırmaya gidiyor.
- İkon kaynağı ortama göre değişiyor ve bu **bilinçli**: geliştirmede `src`,
  gerçek derlemede `drawable`. Sebep `react-native-screens` 4.16'nın native
  kodu — release'te JS varlığını kaynak olarak yalnızca adı `_` ile başlıyorsa
  çözüyor, Expo'nun ürettiği ad (`assets_images_tabicons_notes`) öyle olmadığı
  için ikon sessizce çizilmiyordu. `drawable` yolu adı doğrudan `getIdentifier`
  ile arıyor. Gerçek Android kaynaklarını `plugins/with-tab-icons.js` prebuild
  sırasında `res/drawable-*` altına kopyalıyor. Expo Go'da o kaynaklar
  bulunmadığı için orada `src` şart.
- Alt kenar boşluğu `SafeAreaView`'e bırakılmıyor; ekranlar `edges={['top',
  'left', 'right']}` kullanıp hesabı açıkça yapıyor: `insets.bottom +
  TabBarHeight`. Sekmeli ekranlarda alt kenarı bazen çubuğun tüketmesi yüzünden
  ne kadar boşluk eklendiği belirsizdi ve `+` düğmesi çubuğun altında kalıyordu.
- `expo-constants` ve `expo-linking` de hiçbir yerde import edilmiyor ama
  **kaldırılmamalı**: `expo-router`'ın isteğe bağlı olmayan peer bağımlılıkları ve
  çalışma anında kendisi import ediyor (`router-store`, `useLinking`). Temizlik
  taramasında ikisi de "kullanılmıyor" diye görünür.
- `expo-system-ui` kodda hiçbir yerde import edilmiyor ama **kaldırılmamalı**:
  `app.json`'daki `userInterfaceStyle` ayarının native karşılığını o kuruyor.
  Onsuz cihaz teması doğru okunmuyor ve "Sistem" görünüm seçeneği çalışmıyor.
  `expo prebuild` bunu uyarı olarak söylüyor.
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

`eas.json` silindi: derleme yerel Gradle ile yapılıyor, EAS hiç kullanılmadı ve
dosyadaki `development` profili artık kurulu olmayan `expo-dev-client` paketini
istiyordu (o paket kurulu olsa `npm start` Expo Go yerine geliştirme derlemesi
moduna geçer). Buluta dönülürse `npx eas-cli build:configure` dosyayı yeniden
üretir.

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

## APK derlemesi

Gradle, asistan oturumunun kabuğundan **çalışmaz**: kendi süreçleri arasında
loopback soketi açıyor ve orada `Unable to establish loopback connection` ile
düşüyor. Beş satırlık bir Java programı (`Selector.open()`) aynı hatayı verdiği
için sorun projede değil. `gradlew -v` başarılı olur ama gerçek görevler düşer.
Derleme komutunu kullanıcı kendi terminalinde çalıştırır; asistan hazırlığı
yapar ve çıktıyı doğrular. Ayrıntılar README'de.

İki tuzak kayda değer:

- `android/local.properties` prebuild tarafından her zaman üretilmiyor. Yazarken
  **eğik bölü** kullanılmalı; ters bölü Java properties'te kaçış karakteri,
  `C:\Users` → `C:Users` olur ve derleme `Invalid file path` ile düşer.
- `android/` klasörü varken `expo start` geliştirme derlemesi moduna geçiyor.
  npm script'lerine `--go` gömülü, bu yüzden `npm start` Expo Go açmaya devam eder.

## Kontroller

- `npx tsc --noEmit` — tip kontrolü
- `npx expo export --platform android` — bundle gerçekten derleniyor mu (dist/ silinebilir)
- `npm start` — Expo Go ile telefonda test
