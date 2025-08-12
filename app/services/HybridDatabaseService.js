import LocalDatabaseService from './LocalDatabaseService';
import SupabaseService from './SupabaseService';

class HybridDatabaseService {
  constructor() {
    this.localDB = LocalDatabaseService;
    this.supabase = SupabaseService;
    this.isInitialized = false;
  }

  // İlk kurulum - tüm ortak verileri indir
  async initializeDatabase() {
    try {
      console.log('🔄 Veritabanı başlatılıyor...');
      
      // Supabase'den tüm ortak verileri çek
      const [categories, wordSets, words, translations] = await Promise.all([
        this.supabase.getAllCategories(),
        this.supabase.getWordSets(),
        this.supabase.getAllWordsFromWordsTable(),
        this.supabase.getAllWords()
      ]);

      console.log(`📥 İndirilen veriler: ${categories?.length || 0} kategori, ${wordSets?.length || 0} kelime seti, ${words?.length || 0} kelime, ${translations?.length || 0} çeviri`);

      // Yerel veritabanına kaydet
      await Promise.all([
        this.localDB.insertCategories(categories || []),
        this.localDB.insertWordSets(wordSets || []),
        this.localDB.insertWords(words || []),
        this.localDB.insertWordTranslations(translations || [])
      ]);

      // Database versiyonunu güncelle
      await this.localDB.updateDatabaseVersion(new Date().toISOString());
      
      this.isInitialized = true;
      console.log('✅ Veritabanı başarıyla başlatıldı');
      
      return true;
    } catch (error) {
      console.error('❌ Veritabanı başlatma hatası:', error);
      throw error;
    }
  }

  // Veritabanının başlatılıp başlatılmadığını kontrol et
  async checkDatabaseStatus() {
    try {
      console.log('🔍 Veritabanı durumu kontrol ediliyor...');
      
      // 1. Veritabanı versiyonunu kontrol et
      const version = await this.localDB.getDatabaseVersion();
      console.log(`📊 Mevcut veritabanı versiyonu: ${version}`);
      
      // 2. Temel tablolarda veri var mı kontrol et
      const [wordSets, categories, words, translations] = await Promise.all([
        this.localDB.getWordSets(),
        this.localDB.getCategories(),
        this.localDB.getWords(),
        this.localDB.getAllWords()
      ]);

      const hasData = version !== '0' && 
                     wordSets.length > 0 && 
                     categories.length > 0 && 
                     words.length > 0 && 
                     translations.length > 0;

      console.log(`📈 Veri durumu: Sets: ${wordSets.length}, Categories: ${categories.length}, Words: ${words.length}, Translations: ${translations.length}`);
      
      if (!hasData) {
        console.log('📋 Veritabanı boş veya eksik, ilk kurulum yapılıyor...');
        return await this.initializeDatabase();
      }
      
      this.isInitialized = true;
      console.log('✅ Veritabanı zaten başlatılmış, Supabase\'den indirme yapılmayacak');
      return true;
    } catch (error) {
      console.error('❌ Veritabanı durumu kontrol hatası:', error);
      console.log('🔄 Güvenlik için yeniden başlatılıyor...');
      return await this.initializeDatabase();
    }
  }

  // Kelime setlerini getir (yerel)
  async getWordSets() {
    // Database zaten başlatıldı, direkt yerel veriyi dön
    if (this.isInitialized) {
      return await this.localDB.getWordSets();
    }
    
    // Eğer başlatılmamışsa kontrol et
    await this.checkDatabaseStatus();
    return await this.localDB.getWordSets();
  }

  // Tüm kelimeleri getir (yerel)
  async getAllWords() {
    // Database zaten başlatıldı, direkt yerel veriyi dön
    if (this.isInitialized) {
      return await this.localDB.getAllWords();
    }
    
    // Eğer başlatılmamışsa kontrol et
    await this.checkDatabaseStatus();
    return await this.localDB.getAllWords();
  }

  // Set ID'ye göre kelimeleri getir (yerel)
  async getWordsBySetId(setId) {
    // Database zaten başlatıldı, direkt yerel veriyi dön
    if (this.isInitialized) {
      return await this.localDB.getWordsBySetId(setId);
    }
    
    // Eğer başlatılmamışsa kontrol et
    await this.checkDatabaseStatus();
    return await this.localDB.getWordsBySetId(setId);
  }

  // Tüm kategorileri getir (yerel)
  async getCategories() {
    if (this.isInitialized) {
      return await this.localDB.getCategories();
    }
    
    await this.checkDatabaseStatus();
    return await this.localDB.getCategories();
  }

  // Set ID'ye göre kelime sayısını getir (yerel) - PERFORMANSLI
  async getWordCountByCategoryId(setId) {
    if (this.isInitialized) {
      return await this.localDB.getWordsCountByCategoryId(setId);
    }
    
    await this.checkDatabaseStatus();
    return await this.localDB.getWordsCountByCategoryId(setId);
  }

  // Kategori ID'ye göre kelimeleri getir (yerel)
  async getWordsByCategoryId(categoryId) {
    if (this.isInitialized) {
      return await this.localDB.getWordsByCategoryId(categoryId);
    }
    
    await this.checkDatabaseStatus();
    return await this.localDB.getWordsByCategoryId(categoryId);
  }

  // Set ID'ye göre kategorileri getir (yerel)
  async getCategoriesBySetId(setId) {
    if (this.isInitialized) {
      return await this.localDB.getCategoriesBySetId(setId);
    }
    
    await this.checkDatabaseStatus();
    return await this.localDB.getCategoriesBySetId(setId);
  }

  // Kullanıcı verilerini getir (hibrit - önce yerel, sonra Supabase)
  async getUserData(userId) {
    try {
      // Önce yerel veritabanından dene
      const localUser = await this.localDB.getUserById(userId);
      if (localUser) {
        return localUser;
      }
      
      // Yerel yoksa Supabase'den çek ve yerel'e kaydet
      const supabaseUser = await this.supabase.getUserById(userId);
      if (supabaseUser) {
        await this.localDB.insertUser(supabaseUser);
        return supabaseUser;
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı verisi getirme hatası:', error);
      return null;
    }
  }

  // Kullanıcı verilerini kaydet (hem yerel hem Supabase)
  async saveUserData(userData) {
    try {
      // Önce Supabase'e kaydet
      const supabaseResult = await this.supabase.createUser(userData);
      
      // Sonra yerel'e kaydet
      await this.localDB.insertUser(userData);
      
      return supabaseResult;
    } catch (error) {
      console.error('Kullanıcı verisi kaydetme hatası:', error);
      throw error;
    }
  }

  // Kullanıcı ilerleme verilerini kaydet (hibrit)
  async saveUserProgress(userId, setId, progressData) {
    try {
      // Önce yerel'e kaydet (hızlı erişim için)
      await this.localDB.insertUserSetData({
        user_id: userId,
        set_id: setId,
        ...progressData
      });
      
      // Sonra Supabase'e kaydet (senkronizasyon için)
      await this.supabase.updateUserProgress(userId, setId, progressData);
      
      return true;
    } catch (error) {
      console.error('İlerleme kaydetme hatası:', error);
      throw error;
    }
  }

  // Kullanıcı ilerleme verilerini getir (hibrit)
  async getUserProgress(userId, setId) {
    try {
      // Önce yerel'den dene
      const localProgress = await this.localDB.getUserSetData(userId, setId);
      if (localProgress) {
        return localProgress;
      }
      
      // Yerel yoksa Supabase'den çek
      const supabaseProgress = await this.supabase.getUserProgress(userId, setId);
      if (supabaseProgress) {
        await this.localDB.insertUserSetData(supabaseProgress);
        return supabaseProgress;
      }
      
      return null;
    } catch (error) {
      console.error('İlerleme getirme hatası:', error);
      return null;
    }
  }

  // Kelime öğrenme durumunu kaydet (hibrit)
  async saveWordLearningStatus(userId, wordId, learningData) {
    try {
      // Önce yerel'e kaydet
      await this.localDB.insertUserWordData({
        user_id: userId,
        word_id: wordId,
        ...learningData
      });
      
      // Sonra Supabase'e kaydet
      await this.supabase.updateUserWordData(userId, wordId, learningData);
      
      return true;
    } catch (error) {
      console.error('Kelime öğrenme durumu kaydetme hatası:', error);
      throw error;
    }
  }

  // Quiz sonuçlarını kaydet (hibrit)
  async saveQuizResult(quizData) {
    try {
      // Önce yerel'e kaydet
      await this.localDB.insertQuizResult(quizData);
      
      // Sonra Supabase'e kaydet
      await this.supabase.saveQuizResult(quizData);
      
      return true;
    } catch (error) {
      console.error('Quiz sonucu kaydetme hatası:', error);
      throw error;
    }
  }

  // Favori kelimeleri kaydet (hibrit)
  async saveFavoriteWord(userId, wordId) {
    try {
      // Önce yerel'e kaydet
      await this.localDB.insertUserFavorite(userId, wordId);
      
      // Sonra Supabase'e kaydet
      await this.supabase.addToFavorites(userId, wordId);
      
      return true;
    } catch (error) {
      console.error('Favori kelime kaydetme hatası:', error);
      throw error;
    }
  }

  // Favori kelimeleri getir (hibrit)
  async getFavoriteWords(userId) {
    try {
      // Önce yerel'den dene
      const localFavorites = await this.localDB.getUserFavorites(userId);
      if (localFavorites && localFavorites.length > 0) {
        return localFavorites;
      }
      
      // Yerel yoksa Supabase'den çek
      const supabaseFavorites = await this.supabase.getUserFavorites(userId);
      if (supabaseFavorites) {
        // Yerel'e kaydet
        for (const favorite of supabaseFavorites) {
          await this.localDB.insertUserFavorite(userId, favorite.word_id);
        }
        return supabaseFavorites;
      }
      
      return [];
    } catch (error) {
      console.error('Favori kelimeler getirme hatası:', error);
      return [];
    }
  }

  // Veritabanını senkronize et (aylık güncelleme için)
  async syncDatabase() {
    try {
      console.log('🔄 Veritabanı senkronizasyonu başlatılıyor...');
      
      // Supabase'den güncel verileri çek
      const [categories, wordSets, words, translations] = await Promise.all([
        this.supabase.getAllCategories(),
        this.supabase.getWordSets(),
        this.supabase.getAllWordsFromWordsTable(),
        this.supabase.getAllWords()
      ]);

      // Yerel veritabanını güncelle
      await Promise.all([
        this.localDB.insertCategories(categories || []),
        this.localDB.insertWordSets(wordSets || []),
        this.localDB.insertWords(words || []),
        this.localDB.insertWordTranslations(translations || [])
      ]);

      // Versiyonu güncelle
      await this.localDB.updateDatabaseVersion(new Date().toISOString());
      
      console.log('✅ Veritabanı senkronizasyonu tamamlandı');
      return true;
    } catch (error) {
      console.error('❌ Veritabanı senkronizasyon hatası:', error);
      throw error;
    }
  }

  // Veritabanını temizle (test için)
  async clearDatabase() {
    try {
      await this.localDB.clearAllData();
      this.isInitialized = false;
      console.log('🗑️ Veritabanı temizlendi, bir sonraki istekte yeniden indirilecek');
      return true;
    } catch (error) {
      console.error('❌ Veritabanı temizleme hatası:', error);
      throw error;
    }
  }

  // Debug: Veritabanı durumunu kontrol et
  async getDebugInfo() {
    try {
      const version = await this.localDB.getDatabaseVersion();
      const [wordSets, categories, words, translations] = await Promise.all([
        this.localDB.getWordSets(),
        this.localDB.getCategories(), 
        this.localDB.getWords(),
        this.localDB.getAllWords()
      ]);

      return {
        isInitialized: this.isInitialized,
        version,
        counts: {
          wordSets: wordSets.length,
          categories: categories.length,
          words: words.length,
          translations: translations.length
        }
      };
    } catch (error) {
      console.error('❌ Debug bilgisi alınamadı:', error);
      return { error: error.message };
    }
  }
}

export default new HybridDatabaseService(); 