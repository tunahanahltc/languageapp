# Proje Analizi ve Kurulum Raporu

## 1. Uygulama Mantığı ve Tanımı

**Proje Adı:** Vocabulary App (LanguageApp)

**Genel Tanım:**
Bu proje, React Native (Expo) kullanılarak geliştirilmiş, hibrit veri mimarisine sahip bir dil öğrenme ve kelime ezberleme uygulamasıdır. Kullanıcıların İngilizce kelimeleri setler ve kategoriler halinde öğrenmesini, pratik yapmasını ve gelişimlerini takip etmesini sağlar.

**Temel Mimari:**
*   **Frontend:** React Native (Expo v52), TypeScript.
*   **Navigasyon:** React Navigation (Bottom Tabs ve Stack).
*   **Veri Yönetimi:** Hibrit yapı.
    *   **Supabase:** Uzak sunucu, kimlik doğrulama (Auth) ve ana veri kaynağı (Kelimeler, Setler).
    *   **SQLite (Expo SQLite):** Çevrimdışı erişim ve performans için yerel veritabanı.
*   **Senkronizasyon:** `HybridDatabaseService` servisi, uygulama açılışında veya belirli tetikleyicilerle Supabase'den verileri çeker ve yerel SQLite veritabanına yazar. Kullanıcı ilerlemeleri (öğrenilen kelimeler, favoriler) hem yerel hem de uzak sunucuya kaydedilir.

**Ana Özellikler:**
*   **Kimlik Doğrulama:** Kullanıcı kayıt, giriş ve profil yönetimi.
*   **Kelime Çalışma:** Kelimeler "Setler" ve "Kategoriler" altında gruplanmıştır.
*   **Öğrenme Modları:**
    *   **Flashcards:** Kelime kartları ile çalışma.
    *   **Practice (Quiz):** Öğrenilenleri test etme.
*   **İlerleme Takibi:** Öğrenilen kelime sayısı, seri (streak) takibi ve puanlama sistemi.
*   **Çoklu Dil Desteği:** Altyapı olarak kelime çevirileri ve telaffuz (Text-to-Speech) desteği mevcuttur.

## 2. Öneriler

Kod tabanının incelenmesi sonucunda belirlenen iyileştirme önerileri:

1.  **Tip Güvenliği (Type Safety):**
    *   `HybridDatabaseService.ts` dosyasında `as any` kullanımı yaygın. Veri bütünlüğünü korumak için Supabase'den gelen veriler ile yerel veritabanı şemaları arasında düzgün "mapper" fonksiyonları yazılmalı ve `any` kullanımından kaçınılmalıdır.

2.  **Hata Yönetimi ve Kullanıcı Bildirimi:**
    *   Veri senkronizasyonu sırasında oluşabilecek hatalar (internet kopması vb.) kullanıcıya daha açık bir şekilde bildirilmeli. Şu an konsola log basılıyor ancak kullanıcı arayüzünde bir "Senkronizasyon Hatası" uyarısı görünmeyebilir.

3.  **Performans Optimizasyonu:**
    *   Büyük veri setlerinin (tüm kelimeler ve çeviriler) her açılışta veya senkronizasyonda çekilmesi (her ne kadar versiyon kontrolü olsa da) performansı etkileyebilir. "Lazy loading" (tembel yükleme) veya sadece değişen verilerin (delta updates) çekilmesi mekanizması düşünülebilir.

4.  **Offline-First Yaklaşımı:**
    *   Uygulama zaten offline desteği sunuyor ancak `userProfile` güncellemeleri gibi bazı işlemler sadece online çalışıyor olabilir. "Queue" (kuyruk) yapısı kurularak, cihaz offline iken yapılan işlemlerin online olunca sunucuya gönderilmesi sağlanabilir.

5.  **Güvenlik:**
    *   Supabase tarafında "Row Level Security" (RLS) politikalarının doğru yapılandırıldığından emin olunmalı. Kullanıcılar sadece kendi ilerleme verilerini okuyup yazabilmeli.

## 3. Kurulum İçin Gerekli Komutlar

Projeyi yerel ortamda çalıştırmak için aşağıdaki adımları izleyin:

### Ön Gereksinimler
*   Node.js (LTS sürümü önerilir)
*   Git

### Kurulum Adımları

1.  **Bağımlılıkları Yükleyin:**
    Proje dizininde terminali açın ve aşağıdaki komutu çalıştırın. `React 19` ve `Expo 52` uyumluluk sorunları olabileceğinden `--legacy-peer-deps` bayrağı eklenebilir.

    ```bash
    npm install --legacy-peer-deps
    ```
    *Alternatif olarak `yarn` veya `bun` kullanıyorsanız `yarn install` veya `bun install`.*

2.  **Supabase Bağlantısı:**
    Projenin çalışması için Supabase URL ve Anon Key bilgilerine ihtiyacı vardır. Genellikle bu bilgiler `.env` dosyasında veya kod içinde sabit (config) dosyasında tutulur. `app/config/supabase.ts` dosyasını kontrol ederek gerekli API anahtarlarının tanımlı olduğundan emin olun.
    *(Eğer `.env` dosyası yoksa, proje sahibinden temin etmeniz veya kendi Supabase projenizi oluşturup `SUPABASE_SETUP.md` dosyasındaki talimatları izlemeniz gerekir.)*

3.  **Uygulamayı Başlatın:**
    Aşağıdaki komutla geliştirme sunucusunu başlatın:

    ```bash
    npx expo start
    ```

4.  **Cihazda Çalıştırma:**
    *   **Fiziksel Cihaz:** Telefonunuza "Expo Go" uygulamasını indirin ve terminalde çıkan QR kodu taratın.
    *   **Android Emülatör:** Android Studio kurulu ise terminalde `a` tuşuna basın.
    *   **iOS Simülatör (Mac):** Xcode kurulu ise terminalde `i` tuşuna basın.

### Sorun Giderme
*   Eğer "dependency tree" hatası alırsanız `npm install --force` deneyebilirsiniz (önerilmez, ancak son çare olabilir).
*   Veritabanı hataları alırsanız, uygulamanın `AsyncStorage` veya `SQLite` verilerini temizleyip tekrar başlatmayı deneyin.
