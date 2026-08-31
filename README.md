# LanguageApp

LanguageApp, dil öğrenimini destekleyen mobil/çapraz-platform ön uç uygulaması için hazırlanmış, modüler ve üretime hazır yaklaşımları gösteren bir proje iskeletidir. Bu README işe alım değerlendirmelerinde okunaklı ve profesyonel görünmesi amacıyla hazırlanmıştır.

## Öne çıkan özellikler
- Expo tabanlı React Native uygulaması (Android / iOS / Web)
- Supabase ile kimlik doğrulama ve uzak veri senkronizasyonu
- Hybrid local DB (expo-sqlite) ve uzak DB senkronizasyon mimarisi
- Context tabanlı durum yönetimi: Auth, Theme, Data
- Modüler navigation (AuthNavigator, TabNavigator)
- Çoklu platforma uygun UI ve performans optimizasyonu

## Teknoloji yığını
- Frontend: React Native + Expo
- Navigasyon: @react-navigation
- Veri: Supabase (Postgres) + expo-sqlite (offline-first)
- Dil: TypeScript

## Proje yapısı (kısa açıklama)
- App.tsx / index.ts : Uygulama başlangıç noktası ve root container
- app/components : Paylaşılan UI bileşenleri
- app/navigation : Navigator tanımları (Auth ve Tab navigatörleri)
- app/contexts : Auth, Data, Theme gibi global context'ler
- app/services : HybridDatabaseService ve diğer servisler (network, db, sync)
- app/screens : Ekranlar (login, main, vs.)
- app/types : TypeScript tipleri ve arayüzler
- assets : Görseller ve statik kaynaklar
- docs/ : Proje analizleri, Supabase kurulum ve diğer dokümantasyonlar
- sql/ : Supabase için güvenlik ve seed scriptleri

## Kurulum (geliştirici ortamı)
Ön koşullar: Node.js, npm/yarn, Expo CLI kurulmuş olmalı.

1. Depoyu klonlayın
   git clone https://github.com/tunahanahltc/languageapp.git
2. Bağımlılıkları yükleyin
   cd languageapp
   npm install
3. Ortam değişkenleri (.env)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - (Geliştirme için gerekirse) SUPABASE_SERVICE_ROLE_KEY
   Bu değerleri proje içinde kullanılan config dosyasına veya CI/CD gizli değişkenlerine ekleyin.
4. Supabase veritabanını hazırlayın
   - sql/ içindeki `supabase_security.sql` ve `supabase_seed_data.sql` scriptlerini çalıştırın.
   - docs/SUPABASE_SETUP.md dosyasında adım adım kurulum notları bulunmaktadır.
5. Uygulamayı çalıştırın
   npm run start
   npm run android   # veya ios, web

## Çalışma ve mimari notları
- Auth akışı AuthContext tarafından yönetilir; giriş sonrası veri senkronizasyonu tetiklenir.
- HybridDatabaseService, offline-first senaryolar için yerel SQLite ve uzak Supabase arasındaki köprüyü sağlar.
- Platforma özgü optimizasyonlar (ör. Android navigation bar davranışı) App.tsx içinde ele alınmıştır.

## Test, kalite ve bağımlılık kontrolü
- TypeScript tipi kontrolleri için `tsc` çalıştırın.
- Gereksiz bağımlılıkları kontrol etmek için `npx depcheck` kullanılabilir.

## Katkıda bulunma
1. Fork → feature/{kısa-açıklama} branch oluşturun
2. Değişikliklerinizi anlamlı commit mesajlarıyla yapın
3. Pull request açın; PR açıklamasında yaptığınız değişiklikleri ve test adımlarını ekleyin

## Lisans
Bu depo varsayılan olarak MIT benzeri açık kaynak kullanımına uygundur. (Lisans eklemek isterseniz LICENSE dosyası ekleyin.)

## İletişim
Daha fazla bilgi veya kurum içi değerlendirme için repo sahibiyle GitHub üzerinden iletişime geçin.

---
Bu README, işe alım sürecinde kod incelenirken projenin amacını, mimarisini ve çalıştırma adımlarını net ve profesyonel şekilde göstermeyi hedefler. İsterseniz İngilizce versiyonunu da ekleyip, örnek ekran görüntüleri ve API dökümantasyonu ile genişletebilirim.
