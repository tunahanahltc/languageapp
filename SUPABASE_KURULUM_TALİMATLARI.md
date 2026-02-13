# Supabase Veritabanı Kurulum Talimatları

## Hatayı Düzeltmek İçin Adımlar

### 1. Supabase Dashboard'a Giriş Yapın

1. [supabase.com](https://supabase.com) adresine gidin
2. Projenize giriş yapın
3. Sol menüden **SQL Editor** seçeneğine tıklayın

### 2. Seed Script'i Çalıştırın

1. SQL Editor'de **New Query** butonuna tıklayın
2. `supabase_seed_data.sql` dosyasının içeriğini kopyalayın
3. SQL Editor'e yapıştırın
4. **Run** butonuna tıklayın (veya Ctrl+Enter)
5. Hata olmadığından emin olun - başarılı olursa yeşil bir onay mesajı görmelisiniz

### 3. Verilerin Eklendiğini Doğrulayın

SQL Editor'de aşağıdaki sorguları çalıştırarak verilerin eklendiğini kontrol edin:

```sql
-- Set 3'ün var olduğunu kontrol et (hataya neden olan set)
SELECT * FROM word_sets WHERE set_id = 3;

-- Tüm setleri görüntüle
SELECT * FROM word_sets ORDER BY set_id;

-- Kategorileri görüntüle
SELECT * FROM categories WHERE set_id = 3;

-- Her kategorideki kelime sayısını kontrol et
SELECT c.category_name, COUNT(w.word_id) as word_count
FROM categories c
LEFT JOIN words w ON c.category_id = w.category_id
GROUP BY c.category_id, c.category_name
ORDER BY c.category_id;
```

### 4. Uygulamayı Yeniden Başlatın

1. Terminal'de çalışan Expo sunucusunu durdurun (Ctrl+C)
2. Uygulamayı yeniden başlatın:
   ```bash
   npx expo start
   ```
3. Bu işlem `SyncService.initializeDatabase()` fonksiyonunu tetikleyecek ve Supabase'den yeni verileri çekecektir

### 5. Hatayı Test Edin

1. Uygulamada **"Eğitim ve Bilim"** kelime setine gidin
2. **"Seti Başlat"** butonuna tıklayın
3. Loglarda artık şu hataları görmemelisiniz:
   - ❌ `ERROR Supabase saveUserProgress error`
   - ❌ `ERROR Supabase batchSaveWordLearningStatus error`
4. Bunun yerine şu başarı mesajlarını görmelisiniz:
   - ✅ `User set data kaydedildi`
   - ✅ `Set kelimeleri user_words_data'ya eklendi`

## Sorun Giderme

### Hata: "duplicate key value violates unique constraint"

Bu normal bir durumdur - bazı veriler zaten mevcut. Script `ON CONFLICT` kullanarak mevcut verileri günceller.

### Hata: "relation does not exist"

Tablolar henüz oluşturulmamış olabilir. Önce `sql_tables.md` dosyasındaki tablo oluşturma scriptlerini çalıştırın.

### Veriler hala senkronize olmuyor

1. Uygulamayı tamamen kapatın
2. Expo cache'ini temizleyin:
   ```bash
   npx expo start -c
   ```
3. Eğer sorun devam ederse, local veritabanını temizleyin ve yeniden senkronize edin

## Sonraki Adımlar

Script başarıyla çalıştıktan sonra:
- Diğer kelime setleri için de benzer veriler ekleyebilirsiniz
- Kendi özel kelime setlerinizi oluşturabilirsiniz
- Mevcut setlere daha fazla kelime ekleyebilirsiniz
