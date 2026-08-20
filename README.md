# Notex

Çevrimdışı çalışan not ve plan uygulaması. Hedef platform Android.

Veri tamamen cihazda, bir SQLite dosyasında (`notex.db`) tutulur. Sunucu, hesap,
oturum açma ve senkronizasyon yok; uygulama internet bağlantısı olmadan çalışır.

## Ne yapar

**Notlar** — başlık ve içerik. Son düzenlenen en üstte. Satıra dokunup düzenle.

**Planlar** — bir plan tek bir görev değil, görev listesidir. `+` basınca hangi
türde olacağını sorar:

- **Görev listesi** — alt alta görevler, tik atarak tamamla.
- **Çizelge** — her satırda tik, görev adı, başlangıç ve bitiş saati. Saate
  dokunmak Android'in saat seçicisini açar; "Temizle" ile saati boşaltabilirsin.

Not ve plan sayfaları sağdan kayarak açılır, sol üstteki `←` ile kapanır.

Plana girip alt alta satır eklersin. Görev metnine dokunmak o satırı düzenlemeye
açar; boşaltıp çıkarsan satır silinir. Satırları silmek ve sıralamak için plan
içindeki `⋮` menüsü kullanılır — listelerdeki mantığın aynısı. Çizelgelerde liste satırında günün
kapsamı da görünür (`09:00 – 17:30`). Planın tamamlanma oranı görevlerinden
hesaplanır; listede `3/5 görev tamam` ve ince bir ilerleme çubuğu görünür. Tümü
biten planlar üstü çizili olarak listenin altına iner, tarihi geçmişler kırmızı
etiketlenir.


**Modlar** — her listenin sağ üstünde bir `⋮` düğmesi var: "Sırala" ve "Seç".

*Sıralama modunda* satırı basılı tutup yukarı aşağı taşıyorsun; sıra cihazda
kalıcı olarak saklanır. *Seçim modunda* satırlara dokunarak birden fazlasını
seçip köşedeki çöp kutusuyla siliyorsun. Her iki mod da başlıktaki "Bitti" /
"Vazgeç" ile kapanır.

Seçim moduna kısayol: satıra uzun basmak da doğrudan açar (sıralama modunda
uzun basış sürüklemeye ayrıldığı için orada geçerli değil).
Listelerin sırası tamamen senin elinde: otomatik sıralama yok. Yeni not ve yeni
plan listenin başına, yeni görev listenin sonuna eklenir. Tamamlanan planlar ve
işaretlenen görevler yerinde kalır, kendiliğinden aşağı inmez — elle taşınan bir
sırayla otomatik sıralama bir arada çalışmaz.

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
| `src/components/plan-detail.tsx` | Bir planın içi: başlık, tarih, görev listesi |
| `src/components/app-tabs.tsx` | Sekmeler; adları dosya adlarıyla eşleşir |
| `src/constants/theme.ts` | Bütün renkler ve boşluklar |
| `src/lib/date.ts` | `YYYY-MM-DD` yerel tarih yardımcıları |
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

Palet "Kağıt": kremli zemin, toprak tonu aksan. Bütün renkler
`src/constants/theme.ts` içindeki `Colors` nesnesinde, açık ve koyu tema için
ayrı. `theme.ts` dışında hiçbir dosyada ham renk kodu yok — paleti değiştirmek
için tek dosya yeter.

Token'lar: `text`, `textSecondary`, `background`, `backgroundElement`,
`backgroundSelected`, `accent`, `onAccent`, `danger`.

## İkonlar

İkonlar elle çizilmedi, koddan üretiliyor. Bağımlılık gerekmez (PIL kurmaya
gerek yok):

```bash
python scripts/make-icons.py
```

Marka, script'in başındaki `MARK` listesinde kapsül olarak tanımlı: iki not
satırı ve bir onay işareti. Değiştirip yeniden çalıştırmak `assets/images/`
altındaki altı görseli birden yeniler.

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

**Metin alanları kontrolsüz** (`defaultValue` + ref). Her tuşta metni state
üzerinden `value` olarak geri yazmak Android klavyesinde harf düşmesine yol
açıyor. Bu yüzden yeni bir `TextInput` eklerken aynı deseni izleyin.
