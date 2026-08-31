# Proje Denetim Raporu (Security & Efficiency Audit)

Bu rapor, projenizin yeni gereksinimlere (Free/Local-only modu, Backend-Agnostic yapı, Verimlilik) göre incelenmesi sonucunda oluşturulmuştur.

## 1. Mimari ve Yapısal Sorunlar (Backend-Agnostic Hedefine Ters)

*   **Sıkı Bağımlılık (Tight Coupling):** `HybridDatabaseService.ts` dosyası doğrudan `import SupabaseService` satırı ile Supabase servisine bağımlı.
    *   *Sorun:* İleride VPS'e geçmek istediğinizde `HybridDatabaseService`'in kodunu satır satır değiştirmeniz gerekecek.
    *   *Çözüm:* `BackendAdapter` arayüzü (interface) oluşturulmalı ve `HybridDatabaseService` sadece bu arayüzü tanımalı.

*   **Şifre/Auth Mantığı:** `AuthContext.tsx` içinde Supabase'e özgü `onAuthStateChange` dinleyicileri var.
    *   *Sorun:* VPS/Custom Auth sistemine geçildiğinde bu yapı tamamen değişecek.
    *   *Çözüm:* Auth yönetimi de bir `AuthAdapter` üzerinden soyutlanmalı.

## 2. Verimlilik ve Performans Sorunları ("Hunharca" Kullanım)

*   **Tüm Veriyi İndirme (Full Fetch):** `HybridDatabaseService -> initializeDatabase` fonksiyonu `supabase.getAllWords()` çağırıyor.
    *   *Bulgu:* `SupabaseService.ts` satır 242'de `select('*')` ile veritabanındaki **BÜTÜN** kelimeler ve çeviriler çekiliyor.
    *   *Risk:* Kelime sayısı arttıkça (örn: 5000 kelime), uygulama açılışı çok yavaşlayacak ve kullanıcının internet paketini tüketecek.
    *   *Çözüm:* `last_updated_at` parametresi ile sadece yeni/değişen kelimelerin çekilmesi (Delta Sync) şart.

*   **Gereksiz Tekrar İndirme:** `checkAndUpdateWordDataOnLogin` fonksiyonu, veritabanı 7 günden eskiyse `syncDatabase` çağırıyor.
    *   *Bulgu:* Bu fonksiyon yine **her şeyi** baştan aşağı indiriyor. Sadece "yeni eklenen" 3-5 kelime için tüm veritabanını indirmek büyük israf.

*   **Waterfall Sorgular:** `SupabaseService.ts -> getWordsBySetId` (Satır 115)
    *   *Bulgu:* Önce Kategoriler -> Sonra Kelime ID'leri -> Sonra Çeviriler çekiliyor (3 ayrı bekleme süresi).
    *   *Risk:* Bu işlem mobilde yavaş çalışır ve gecikme (latency) yaratır.
    *   *Çözüm:* Supabase üzerinde bir `RPC (Remote Procedure Call)` veya `Viev` oluşturulup tek sorguda çekilmeli.

## 3. Güvenlik Zafiyetleri

*   **Client-Side Trust (İstemciye Güven):**
    *   *Bulgu:* `updateUser` ve `saveUserProgress` fonksiyonlarında, istemciden gelen puan ve seviye bilgisi doğrudan veritabanına yazılıyor.
    *   *Risk:* Kötü niyetli bir kullanıcı, API isteğini taklit ederek (curl vb.) `learned_word_count: 99999` gönderip lider tablosunu manipüle edebilir.
    *   *Çözüm:* Kritik hesaplamalar (Puan artışı vb.) sunucu tarafında (Edge Function) yapılmalı veya "Trusted" (Güvenilir) bir validasyon mekanizması kurulmalı.

*   **RLS (Row Level Security) Eksikliği:**
    *   Kod tarafında RLS mantığına dair bir kısıtlama yok (bu normal, DB tarafında yapılır). Ancak kodun `public` tablolara yazma girişimleri kontrol edilmeli.
    *   *Uyarı:* Supabase panelinden `public.words` ve `word_sets` tablolarının **SADECE OKUNABİLİR** olduğundan, yazma yetkisinin kapalı olduğundan emin olunmalı.

## 4. Yeni "Free Kullanıcı" Gereksinimi ile Çelişkiler

*   **Zorunlu Senkronizasyon:** `AuthContext.tsx -> login` fonksiyonu, `syncUserDataOnLogin`'i çağırıyor.
    *   *Sorun:* Uygulama şu anki haliyle "Kayıtlı Kullanıcı = Sync Zorunlu" mantığında çalışıyor.
    *   *Çözüm:* Kullanıcı ayarlarına "Sadece WiFi ile senkronize et" veya "Senkronizasyonu kapat" seçeneği eklenmeli ya da Free kullanıcılar için bu fonksiyonlar bypass edilmeli.

## Özet ve Aksiyon Planı

Mevcut kod tabanı "Çalışıyor" ancak "Ölçeklenebilir" ve "Güvenli" değil. Sizin talepleriniz doğrultusunda şu adımlar atılmalı:

1.  **Refactor:** `HybridDatabaseService` temizlenip `Interface` yapısına geçilmeli.
2.  **Optimizasyon:** `getAllWords` yerine `getUpdates(since: Date)` mantığına geçilmeli.
3.  **Güvenlik:** Kritik veriler için sunucu tarafı doğrulaması planlanmalı (ileriki aşama).
