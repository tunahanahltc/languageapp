-- ============================================
-- Supabase Seed Data Script
-- ============================================
-- This script populates the word_sets, categories, words, and word_translations tables
-- with initial data to fix the foreign key constraint error.
--
-- IMPORTANT: Run this script in your Supabase SQL Editor
-- After running, restart your app to sync the data.

-- ============================================
-- 1. WORD SETS
-- ============================================

INSERT INTO word_sets (set_id, set_name, difficulty, description, icon, color, created_at, updated_at) VALUES
(1, 'Temel Kelimeler', 'A1', 'Günlük hayatta en çok kullanılan temel kelimeler', '📚', '#10B981', NOW(), NOW()),
(2, 'Orta Seviye', 'B1', 'Orta seviye İngilizce kelimeler', '📖', '#3B82F6', NOW(), NOW()),
(3, 'Eğitim ve Bilim', 'B2', 'Eğitim ve bilim alanında kullanılan kelimeler', '🎓', '#8B5CF6', NOW(), NOW()),
(4, 'İş Hayatı', 'B2', 'İş dünyasında kullanılan kelimeler', '💼', '#F59E0B', NOW(), NOW()),
(5, 'Seyahat', 'A2', 'Seyahat ederken kullanılan kelimeler', '✈️', '#EF4444', NOW(), NOW())
ON CONFLICT (set_id) DO UPDATE SET
  set_name = EXCLUDED.set_name,
  difficulty = EXCLUDED.difficulty,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  updated_at = NOW();

-- ============================================
-- 2. CATEGORIES
-- ============================================

INSERT INTO categories (category_id, set_id, category_name, description, icon, difficulty, created_at) VALUES
-- Set 1: Temel Kelimeler
(1, 1, 'Günlük Hayat', 'Günlük yaşamda kullanılan temel kelimeler', '🏠', 'A1', NOW()),
(2, 1, 'Sayılar ve Renkler', 'Temel sayılar ve renkler', '🔢', 'A1', NOW()),

-- Set 2: Orta Seviye
(3, 2, 'İş ve Meslek', 'İş hayatı ve mesleklerle ilgili kelimeler', '👔', 'B1', NOW()),
(4, 2, 'Duygular', 'Duygu ve hisleri ifade eden kelimeler', '😊', 'B1', NOW()),

-- Set 3: Eğitim ve Bilim (THE MISSING SET CAUSING THE ERROR)
(5, 3, 'Akademik Kelimeler', 'Akademik metinlerde kullanılan kelimeler', '📝', 'B2', NOW()),
(6, 3, 'Bilimsel Terimler', 'Bilim alanında kullanılan terimler', '🔬', 'B2', NOW()),

-- Set 4: İş Hayatı
(7, 4, 'Ofis Kelimeleri', 'Ofis ortamında kullanılan kelimeler', '🖥️', 'B2', NOW()),
(8, 4, 'Toplantı ve Sunum', 'Toplantı ve sunumlarda kullanılan kelimeler', '📊', 'B2', NOW()),

-- Set 5: Seyahat
(9, 5, 'Havaalanı', 'Havaalanında kullanılan kelimeler', '🛫', 'A2', NOW()),
(10, 5, 'Otel ve Konaklama', 'Otel ve konaklama ile ilgili kelimeler', '🏨', 'A2', NOW())
ON CONFLICT (category_id) DO UPDATE SET
  set_id = EXCLUDED.set_id,
  category_name = EXCLUDED.category_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  difficulty = EXCLUDED.difficulty;

-- ============================================
-- 3. WORDS
-- ============================================

INSERT INTO words (word_id, category_id, created_at) VALUES
-- Category 1: Günlük Hayat
(1, 1, NOW()),
(2, 1, NOW()),
(3, 1, NOW()),
(4, 1, NOW()),
(5, 1, NOW()),

-- Category 5: Akademik Kelimeler (Set 3 - Eğitim ve Bilim)
(6, 5, NOW()),
(7, 5, NOW()),
(8, 5, NOW()),
(9, 5, NOW()),
(10, 5, NOW()),

-- Category 6: Bilimsel Terimler (Set 3 - Eğitim ve Bilim)
(11, 6, NOW()),
(12, 6, NOW()),
(13, 6, NOW()),
(14, 6, NOW()),
(15, 6, NOW())
ON CONFLICT (word_id) DO NOTHING;

-- ============================================
-- 4. WORD TRANSLATIONS
-- ============================================

INSERT INTO word_translations (translation_id, word_id, language_code, word_text, meaning, example_sentence, example_sentence_mean, pronunciation, word_type, created_at) VALUES
-- Category 1: Günlük Hayat (word_id 1-5)
(1, 1, 'en', 'house', 'ev', 'I live in a big house.', 'Büyük bir evde yaşıyorum.', 'haʊs', 'noun', NOW()),
(2, 2, 'en', 'water', 'su', 'I drink water every day.', 'Her gün su içerim.', 'ˈwɔːtər', 'noun', NOW()),
(3, 3, 'en', 'food', 'yemek', 'This food is delicious.', 'Bu yemek lezzetli.', 'fuːd', 'noun', NOW()),
(4, 4, 'en', 'family', 'aile', 'My family is very important to me.', 'Ailem benim için çok önemli.', 'ˈfæməli', 'noun', NOW()),
(5, 5, 'en', 'friend', 'arkadaş', 'She is my best friend.', 'O benim en iyi arkadaşım.', 'frend', 'noun', NOW()),

-- Category 5: Akademik Kelimeler (word_id 6-10) - SET 3
(6, 6, 'en', 'research', 'araştırma', 'Scientific research is important.', 'Bilimsel araştırma önemlidir.', 'rɪˈsɜːrtʃ', 'noun', NOW()),
(7, 7, 'en', 'analysis', 'analiz', 'We need to do a detailed analysis.', 'Detaylı bir analiz yapmamız gerekiyor.', 'əˈnæləsɪs', 'noun', NOW()),
(8, 8, 'en', 'theory', 'teori', 'This theory is widely accepted.', 'Bu teori geniş çapta kabul görmüştür.', 'ˈθɪəri', 'noun', NOW()),
(9, 9, 'en', 'hypothesis', 'hipotez', 'We tested our hypothesis.', 'Hipotezimizi test ettik.', 'haɪˈpɑːθəsɪs', 'noun', NOW()),
(10, 10, 'en', 'methodology', 'metodoloji', 'Our methodology is sound.', 'Metodolojimiz sağlamdır.', 'ˌmeθəˈdɑːlədʒi', 'noun', NOW()),

-- Category 6: Bilimsel Terimler (word_id 11-15) - SET 3
(11, 11, 'en', 'experiment', 'deney', 'The experiment was successful.', 'Deney başarılıydı.', 'ɪkˈsperɪmənt', 'noun', NOW()),
(12, 12, 'en', 'data', 'veri', 'We collected a lot of data.', 'Çok fazla veri topladık.', 'ˈdeɪtə', 'noun', NOW()),
(13, 13, 'en', 'conclusion', 'sonuç', 'The conclusion is clear.', 'Sonuç açıktır.', 'kənˈkluːʒən', 'noun', NOW()),
(14, 14, 'en', 'evidence', 'kanıt', 'There is strong evidence.', 'Güçlü kanıtlar var.', 'ˈevɪdəns', 'noun', NOW()),
(15, 15, 'en', 'observation', 'gözlem', 'Careful observation is needed.', 'Dikkatli gözlem gereklidir.', 'ˌɑːbzərˈveɪʃən', 'noun', NOW())
ON CONFLICT (translation_id) DO UPDATE SET
  word_id = EXCLUDED.word_id,
  language_code = EXCLUDED.language_code,
  word_text = EXCLUDED.word_text,
  meaning = EXCLUDED.meaning,
  example_sentence = EXCLUDED.example_sentence,
  example_sentence_mean = EXCLUDED.example_sentence_mean,
  pronunciation = EXCLUDED.pronunciation,
  word_type = EXCLUDED.word_type;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries after the insert to verify the data was inserted correctly

-- Check word_sets
-- SELECT * FROM word_sets ORDER BY set_id;

-- Check categories
-- SELECT * FROM categories ORDER BY category_id;

-- Check words count per category
-- SELECT c.category_name, COUNT(w.word_id) as word_count
-- FROM categories c
-- LEFT JOIN words w ON c.category_id = w.category_id
-- GROUP BY c.category_id, c.category_name
-- ORDER BY c.category_id;

-- Check if set_id 3 exists (the one causing the error)
-- SELECT * FROM word_sets WHERE set_id = 3;

-- Check categories for set_id 3
-- SELECT * FROM categories WHERE set_id = 3;
