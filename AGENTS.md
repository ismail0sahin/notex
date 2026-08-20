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
- `src/components/app-tabs.tsx` — sekmeler (`NativeTabs`). Sekme adı dosya adıyla eşleşmeli.
- `src/hooks/use-selection.ts` — çoklu seçim. Ayrı bir "mod" bayrağı yok: seçim
  boş değilse mod açıktır, son öğe kalkınca kendiliğinden kapanır. Yeni bir listeye
  çoklu seçim eklenecekse bu hook kullanılır, ikinci bir durum değişkeni açılmaz.
- `src/lib/date.ts` — `YYYY-MM-DD` yerel tarih yardımcıları. `toISOString()` UTC'ye
  kaydırdığı için tarih üretmede kullanılmaz.
- Stil: `ThemedText` / `ThemedView` + `Colors`/`Spacing` (`src/constants/theme.ts`).
  Yeni renk veya boşluk değeri elle yazılmaz, token eklenir.

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

## Görseller

İkonlar ve açılış ekranı görseli elle çizilmedi, `scripts/make-icons.py` ile üretiliyor —
bağımlılıksız bir SDF rasterleştirici (PIL gerekmez). Marka, script'in başındaki `MARK`
listesinde kapsül (yuvarlak uçlu kalın çizgi) olarak tanımlı: iki not satırı + onay işareti.
Değiştirmek için `MARK` veya renkleri düzenle, sonra proje kökünde çalıştır:

    python scripts/make-icons.py

Ürettiği dosyalar `assets/images/` altına yazılır: `icon.png`, `android-icon-{background,
foreground,monochrome}.png`, `splash-icon.png`, `favicon.png`. Uyarlanabilir ikonun ön plan
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
