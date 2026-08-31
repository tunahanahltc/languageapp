# LanguageApp

LanguageApp, dil öğrenimini destekleyen mobil (Android, iOS) ve web platformlarında çalışacak şekilde hazırlanmış, üretime yakın bir ön uç uygulama iskeletidir. Bu README işe alım süreçlerinde projenin mimarisini, kullanılan teknoloji yığını ve çalıştırma adımlarını açık, profesyonel şekilde anlatmak amacıyla hazırlanmıştır.

## Projenin Amacı
- Hedef: Kullanıcıların kelime öğrenme, alıştırma ve ilerlemeyi takip etme ihtiyaçlarını karşılayan bir uygulama sunmak.
- Yaklaşım: Offline-first, senkronizasyon yetenekli, test edilebilir ve modüler bir mimari.

## Öne Çıkan Özellikler
- Expo + React Native ile çapraz-platform mobil uygulama
- Supabase ile kimlik doğrulama (Auth) ve uzak veri depolama
- Lokal depolama için expo-sqlite; HybridDatabaseService ile offline-first senkronizasyon
- Context tabanlı durum yönetimi (AuthContext, DataContext, ThemeContext)
- Modüler navigation: AuthNavigator (login/register) ve TabNavigator (ana uygulama)
- TypeScript ile güçlü tip güvenliği

## Mimari Özeti
- App.tsx: Uygulama kökü; SafeArea, Theme ve Context sağlayıcılarını sarmalar. Android için navigation bar davranışı ve temel başlangıç kontrolleri burada yer alır.
- app/contexts: Global state yönetimi. AuthContext giriş/çıkış, token yönetimi ve oturum durumunu sağlar. DataContext veri akışı ve senkronizasyon tetiklerini yönetir.
- app/services/HybridDatabaseService.ts: Lokal SQLite ile Supabase arasındaki veri akışını koordine eder. Değişikliklerin zaman damgası (last_updated) ile takip edilmesi ve çakışma çözümleme stratejileri (örn. latest-wins veya uygulamaya özel çözüm) uygulanması için merkezi noktadır.
- app/navigation: Navigator yapılandırmaları ve ekran hiyerarşisi (stack & tab) burada tanımlıdır.
- app/components, app/screens: Yeniden kullanılabilir UI bileşenleri ve ekranlar.

## Önemli Dosyalar ve Ne Yaptıkları
- package.json: Proje bağımlılıkları ve npm script'leri (start, android, ios, web)
- App.tsx, index.ts: Uygulama başlangıcı
- docs/: Proje analizleri, kurulum rehberleri ve SQL dökümanları
- sql/: Supabase için güvenlik (RLS) ve seed verileri

## Kurulum (Geliştirici)
1. Gereksinimler: Node.js (LTS), npm veya yarn, Expo CLI (globally)
2. Depoyu klonlayın
   git clone https://github.com/tunahanahltc/languageapp.git
   cd languageapp
3. Bağımlılıkları yükleyin
   npm install
4. Ortam değişkenleri (.env)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (sadece yönetimsel script'ler için)
   .env örneğini docs/ veya örnek dosyadan alın.
5. Veritabanı hazırlığı (Supabase)
   - Supabase projesi oluşturun, SQL scriptlerini (sql/supabase_security.sql, sql/supabase_seed_data.sql) çalıştırın.
   - docs/SUPABASE_SETUP.md içindeki adımları takip edin.
6. Uygulamayı başlatın
   npm run start
   npm run android  # Emulatör/cihaz için

## Çalışma ve Geliştirme Notları
- Offline senkronizasyon: Lokal değişiklikler önce expo-sqlite'e yazılır, arka planda HybridDatabaseService tarafından Supabase ile senkronize edilir. Senkronizasyon çatışmaları için uygulama mantığına özel çözüm stratejisi uygulanmalıdır.
- Auth: Supabase JWT token'ları kullanılarak kimlik doğrulama yapılır. Token yenileme ve oturum yönetimi AuthContext içinde sağlanır.
- Performans: Ağ çağrılarını minimize etmek için değişiklik setleri (delta) gönderilir; büyük veri transferleri için pagination kullanılır.

## Test, Lint ve Kalite
- TypeScript derlemesi: npx tsc --noEmit
- Bağımlılık kontrolü: npx depcheck
- Unit/integration test altyapısı eklenmemiştir; tercih edilirse Jest + React Native Testing Library önerilir.

## Deployment Önerileri
- Mobil: Expo Application Services (EAS) ile native build'ler oluşturun.
- Backend/Supabase: Production konfigürasyonunda RLS (Row Level Security) aktif, minimal servis rol anahtarlarının saklanması gerektiğini unutmayın.

## Katkıda Bulunma
1. Fork → feature/{kısa-açıklama} branch oluşturun
2. Anlamlı commit mesajlarıyla değişiklik yapın
3. PR açın; PR açıklamasında test adımlarını belirtin

## Lisans
Depoda lisans dosyası yoksa proje sahibine danışın. Genel kullanım için MIT uygundur.

---
Bu README, teknik değerlendirme ve işe alım sırasında projeyi hızlıca anlamak isteyen geliştiriciler ve mülakat değerlendiricileri için ayrıntılı, odaklanmış bilgiler içerir.
