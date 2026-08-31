# LanguageApp  

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE) [![Expo](https://img.shields.io/badge/expo-%5E54.0.0-blue)](https://expo.dev) [![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20Web-lightgrey)](https://reactnative.dev)

LanguageApp, dil öğrenimini destekleyen mobil/çapraz-platform ön uç uygulaması için hazırlanmış, modüler ve üretime hazır yaklaşımları gösteren bir proje iskeletidir.

Bu README'nin İngilizce versiyonu için: [README (English)](README.en.md)

## Özet
- Expo tabanlı React Native uygulaması (Android / iOS / Web)
- Supabase ile kimlik doğrulama ve uzak veri senkronizasyonu
- Hybrid local DB (expo-sqlite) ve uzak DB senkronizasyon mimarisi

## Hızlı başlangıç
1. git clone https://github.com/tunahanahltc/languageapp.git
2. cd languageapp && npm install
3. .env dosyalarını ayarlayın (SUPABASE_* değişkenleri)
4. sql/ içindeki scriptleri çalıştırın (supabase_security.sql, supabase_seed_data.sql)
5. npm run start

Daha ayrıntılı kurulum ve mimari açıklamaları için proje kökündeki README ve docs/ klasörüne bakın.

---
_İsterseniz bu README'e proje ekran görüntülerini ekleyip, README'nin üst kısmına CI/badge entegrasyonlarıyla güncelleme yapabilirim._
