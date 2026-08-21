# Notex

Çevrimdışı çalışan not ve plan uygulaması. Hedef platform Android.

Veri tamamen cihazda, bir SQLite dosyasında (`notex.db`) tutulur. Sunucu, hesap,
oturum açma ve senkronizasyon yok; uygulama internet bağlantısı olmadan çalışır.

## Ne yapar

**Notlar** — başlık ve içerik. Not açıldığında imleç doğrudan metne gelir;
başlık isteğe bağlı. Boş bırakırsan liste satırında notun ilk satırı başlık
yerine geçer, kalanı önizleme olur.

**Planlar** — bir plan tek bir görev değil, görev listesidir. `+` basınca hangi
türde olacağını sorar:

- **Görev listesi** — alt alta görevler, tik atarak tamamla.
- **Alışveriş listesi** — tiklenen satır listenin altına iner, yapılacaklar
  üstte toplanır; aralarında ince bir çizgi durur.
- **Çizelge** — her satırda tik, görev adı, başlangıç ve bitiş saati. Saate
  dokunmak Android'in saat seçicisini açar (alarm tarzı dönen tekerlek);
  "Temizle" ile saati boşaltabilirsin.

Not ve plan sayfaları sağdan kayarak açılır, sol üstteki `←` ile kapanır.

Yazma satırı plan içinde en üstte sabit durur; yazdığın satır onun hemen altına
eklenir, liste kaydırılsa da yazma satırı kaybolmaz. Görev metnine dokunmak o
satırı düzenlemeye açar; boşaltıp çıkarsan satır silinir. Satırları silmek ve
sıralamak için plan içindeki `⋮` menüsü kullanılır — listelerdeki mantığın aynısı.

Tamamlanan görev ve tümü biten planlarda yazı değişmez, satırın zemini değişir —
aksan renginin zemine karışmış hâli. Planın tamamlanma oranı görevlerinden hesaplanır; listede
`3/5 görev tamam` ve ince bir ilerleme çubuğu görünür. Çizelgelerde liste
satırında günün kapsamı da yazar (`09:00 – 17:30`).

**Modlar** — her listenin sağ üstünde bir `⋮` düğmesi var: "Sırala" ve "Seç".

*Sıralama modunda* satırı basılı tutup yukarı aşağı taşıyorsun; sıra cihazda
kalıcı olarak saklanır. *Seçim modunda* satırlara dokunarak birden fazlasını
seçip köşedeki çöp kutusuyla siliyorsun. Her iki mod da başlıktaki "Bitti" /
"Vazgeç" ile kapanır.

Seçim moduna kısayol: satıra uzun basmak da doğrudan açar (sıralama modunda
uzun basış sürüklemeye ayrıldığı için orada geçerli değil).

Listelerin sırası senin elinde: otomatik sıralama yok. Yeni kayıt her zaman
listenin başına eklenir. Tamamlanan planlar ve işaretlenen görevler yerinde
kalır — tek istisna alışveriş listesi, orada tiklenen satır alta iner. Elle
taşınan bir sırayla otomatik sıralama bir arada çalışmaz.

## Kurulum

```bash
npm install
```

## Telefonda çalıştırma

Proje Expo SDK 54 kullanıyor. Play Store'daki Expo Go SDK 57'ye göredir ve bu
projeyi **açmaz**. Telefona SDK 54 uyumlu sürümü elle kurmak gerekiyor:

<https://github.com/expo/expo-go-releases/releases/download/Expo-Go-54.0.8/Expo-Go-54.0.8.apk>

Kurmadan önce mevcut Expo Go'yu kaldır (paket adı aynı olduğu için Android
üzerine yazmaz) ve Play Store'da otomatik güncellemeyi kapat, yoksa 57'ye geri
çeker.

Sonra:

```bash
npm start
```

QR'ı Expo Go içinden okut. Telefon ve bilgisayar aynı Wi-Fi'da olmalı; ağ
bloklarsa `npx expo start --tunnel`.

## Derleme

Profiller `eas.json` içinde. Kurulabilir APK için:

```bash
npx eas-cli build --profile preview -p android
```

Ücretsiz bir Expo hesabı gerekiyor. Yerel Android SDK gerekmez, derleme bulutta
çalışır.

Uygulama ikonu ve açılış ekranı **native yapılandırmadır**; Expo Go'da görünmez.
Bunları görmek için gerçek bir derleme almak gerekir.

## Proje yapısı

| Dosya | İş |
| --- | --- |
| `src/db/index.ts` | Şema, migration ve bütün SQL sorguları |
| `src/app/_layout.tsx` | `SQLiteProvider`, tema, açılış ekranının kapatılması |
| `src/app/index.tsx` | Notlar sekmesi |
| `src/app/plans.tsx` | Planlar sekmesi (plan listesi) |
| `src/components/plan-detail.tsx` | Bir planın içi: başlık ve görev listesi |
| `src/components/app-tabs.tsx` | Sekmeler; adları dosya adlarıyla eşleşir |
| `src/constants/theme.ts` | Bütün görsel tercihler: renk, boşluk, ölçü, süre |
| `src/constants/strings.ts` | Arayüzde geçen bütün metinler |
| `src/lib/date.ts` | Yerel tarih ve `HH:MM` saat yardımcıları |
| `src/lib/note.ts` | Boş başlığı notun ilk satırından türetme |
| `scripts/make-icons.py` | İkon ve açılış görseli üretici |

Ekran geçişleri `Modal` ile yapılıyor, ayrı route açılmıyor — `NativeTabs` altında
sekme olmayan route'lar sorun çıkarıyor.

## Veri modeli

Üç tablo: `notes`, `plans`, `tasks`. Görevler planına `ON DELETE CASCADE` ile
bağlı, yani plan silinince görevleri de gider.

Şema `PRAGMA user_version` ile versiyonlu. Değişiklik gerektiğinde
`src/db/index.ts` içindeki `DATABASE_VERSION` artırılır ve `migrateDbIfNeeded`
sonuna yeni bir blok eklenir. Var olan bloklar düzenlenmez — kurulu
uygulamalardaki veri bozulur.

## Renkler

Bütün arayüz tasarımı `src/constants/` altındaki iki dosyada. Kural basit:
**kelimeler `strings.ts`'te, görsel her şey `theme.ts`'te.** Bileşenlerin içinde
düz metin, renk kodu ya da çıplak ölçü yok.

`theme.ts` — palet "Kağıt" (kremli zemin, toprak tonu aksan), açık ve koyu tema
için ayrı: `Colors`. Yanında `Spacing`, `FontSize`, `LineHeight`, `FontWeight`,
`Radius`, `Sizes`, `Motion` ve `Glyphs`. Paleti ya da ölçüleri değiştirmek için
tek dosya yeter.

`strings.ts` — ekranda geçen her kelime. Sayı içeren cümleler fonksiyon
(`Strings.plans.running(3)`), böylece dilbilgisi de tek yerde kalıyor.
Uygulamayı başka bir dile çevirmek bu dosyayı değiştirmek demek.

## İkonlar

İkonlar elle çizilmedi, koddan üretiliyor. Bağımlılık gerekmez (PIL kurmaya
gerek yok):

```bash
python scripts/make-icons.py
```

Şekiller script'in başındaki listelerde kapsül (yuvarlak uçlu kalın çizgi)
olarak tanımlı: `MARK` uygulama markası (iki not satırı + onay işareti),
`NOTES_MARK` ve `PLANS_MARK` ise sekme ikonları. Değiştirip yeniden çalıştırmak
`assets/images/` altındaki bütün görselleri yeniler — uygulama ikonu, Android
uyarlanabilir ikonun üç katmanı, açılış görseli ve sekme ikonları.

Sekme ikonları iki durumlu (`notes.png` / `notes-on.png`): `NativeTabs` ikonu
boyamıyor, renk PNG'nin içinde. Tek bir siyah maske kullanılsa koyu temada
kaybolurdu.

## Kontroller

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
npx expo export --platform android
```

Son komut, uygulamayı telefonda açmadan bundle'ın gerçekten derlendiğini
doğrular. Ürettiği `dist/` klasörü silinebilir.

## Bilinmesi gerekenler

**Neden SDK 54?** Proje SDK 57 template'iyle kuruldu, sonra 54'e indirildi.
Gerekçe "Android'de ş/ğ yazılamıyor" sorunuydu ve o teşhis yanlıştı: sorun
Android emülatörünün bilgisayar klavyesini keycode olarak taşımasından
kaynaklanıyordu, bu harflerin keycode'u yok. Gerçek telefonda her iki sürümde de
sorunsuz. 54'te kalma kararı bilinçli; yükseltmek isterseniz `AGENTS.md`
template yamalarını listeliyor.

**Emülatörde Türkçe yazmak** — cihaz ayarlarından "Enable keyboard input"
kapatılıp emülatörün kendi ekran klavyesi kullanılmalı.

**Hedef yalnızca Android.** Web desteği kaldırıldı (`react-native-web`,
`react-dom`, `.web.tsx` dosyaları, `app.json`'daki `web` bloğu). Geri istenirse
hepsi yeniden eklenmeli.

**Metin alanları kontrolsüz** (`defaultValue` + ref). Her tuşta metni state
üzerinden `value` olarak geri yazmak Android klavyesinde harf düşmesine yol
açıyor. Bu yüzden yeni bir `TextInput` eklerken aynı deseni izleyin.
