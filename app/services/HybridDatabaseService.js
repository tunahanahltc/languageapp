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
      
      // Duplicate kayıtları kontrol et ve temizle
      await this.checkAndCleanDuplicateUserWords();
      
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
// app/services/HybridDatabaseService.js  (class içine, saveFavoriteWord yanına ekleyin)
async removeFavoriteWord(userId, wordId) {
  try {
    await this.localDB.deleteUserFavorite(userId, wordId);
    await this.supabase.removeFromFavorites(userId, wordId);
    return true;
  } catch (error) {
    console.error('Favori kelime silme hatası:', error);
    throw error;
  }
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

  // Kullanıcı ilerleme verilerini güncelle (hibrit)
  async updateUserProgress(userId, setId, progressData) {
    try {
      console.log(`🔄 Kullanıcı ilerleme güncelleniyor: User ${userId}, Set ${setId}`);
      console.log(`📊 Progress data:`, progressData);
      console.log('🚨 updateUserProgress fonksiyonu çalışıyor!');
      
      // Önce yerel'e güncelle
      console.log('🔄 Local güncelleme başlatılıyor...');
      try {
        await this.localDB.updateUserSetData(userId, setId, progressData);
        console.log('✅ Local veritabanında güncellendi');
      } catch (localError) {
        console.error('❌ Local güncelleme hatası:', localError);
        throw localError;
      }
      
      // Sonra Supabase'e güncelle
      try {
        await this.supabase.updateUserProgress(userId, setId, progressData);
        console.log('✅ Supabase\'de güncellendi');
      } catch (supabaseError) {
        console.error('⚠️ Supabase güncelleme hatası (local devam ediyor):', supabaseError);
        
        // Eğer Supabase'de kayıt yoksa, önce ekle sonra güncelle
        if (supabaseError.code === '23505') { // Unique constraint violation
          console.log('🔄 Supabase\'de kayıt yok, önce ekleniyor...');
          try {
            await this.supabase.insertUserProgress(userId, setId, progressData);
            console.log('✅ Supabase\'e kayıt eklendi');
          } catch (insertError) {
            console.error('❌ Supabase\'e kayıt ekleme hatası:', insertError);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Kullanıcı ilerleme güncelleme hatası:', error);
      throw error;
    }
  }

  // Kullanıcı ilerleme verilerini getir (hibrit)
  async getUserProgress(userId, setId) {
    try {
      console.log(`🔄 getUserProgress çağrıldı: User ${userId}, Set ${setId}`);
      
      // Önce local'den dene (hızlı erişim için)
      const localProgress = await this.localDB.getUserSetData(userId, setId);
      if (localProgress) {
        console.log('📱 Local\'den veri alındı:', localProgress);
        return localProgress;
      }
      
      // Local'de yoksa Supabase'den çek
      try {
        const supabaseProgress = await this.supabase.getUserProgress(userId, setId);
        if (supabaseProgress) {
          console.log('✅ Supabase\'den veri alındı:', supabaseProgress);
          // Local'e kaydet
          await this.localDB.insertUserSetData(supabaseProgress);
          console.log('✅ Local veritabanına kaydedildi');
          return supabaseProgress;
        }
      } catch (supabaseError) {
        console.error('⚠️ Supabase\'den veri alınamadı:', supabaseError);
      }
      
      console.log('❌ Hiçbir yerden veri alınamadı');
      return null;
    } catch (error) {
      console.error('❌ İlerleme getirme hatası:', error);
      return null;
    }
  }

  // Kullanıcı ilerleme verilerini getir (sadece local'den)
  async getUserProgressLocalOnly(userId, setId) {
    try {
      console.log(`🔄 getUserProgressLocalOnly çağrıldı: User ${userId}, Set ${setId}`);
      
      // Sadece local'den veri çek
      const localProgress = await this.localDB.getUserSetData(userId, setId);
      if (localProgress) {
        console.log('📱 Local\'den veri alındı:', localProgress);
        return localProgress;
      }
      
      console.log('❌ Local\'de veri bulunamadı');
      return null;
    } catch (error) {
      console.error('❌ Local ilerleme getirme hatası:', error);
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

  // Unique constraint kontrolü ve temizleme
  async checkAndCleanDuplicateUserWords() {
    try {
      console.log('🔍 Duplicate user_words_data kayıtları kontrol ediliyor...');
      
      // Yerel veritabanından duplicate kayıtları bul ve temizle
      const duplicates = await this.localDB.findDuplicateUserWords();
      if (duplicates && duplicates.length > 0) {
        console.log(`🧹 ${duplicates.length} duplicate kayıt bulundu, temizleniyor...`);
        await this.localDB.cleanDuplicateUserWords();
        console.log('✅ Duplicate kayıtlar temizlendi');
      } else {
        console.log('✅ Duplicate kayıt bulunamadı');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Duplicate kontrol hatası:', error);
      return false;
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

  // Giriş yapınca tüm kullanıcı verilerini senkronize et
  async syncUserDataOnLogin(userId) {
    try {
      console.log('🔄 Giriş yapıldı, kullanıcı verileri senkronize ediliyor...');
      
      // Tüm kullanıcı verilerini Supabase'den çek
      const [userProfile, favorites] = await Promise.all([
        this.supabase.getUserById(userId),
        this.supabase.getUserFavorites(userId)
      ]);
      
      // Local'e kaydet
      if (userProfile) {
        await this.localDB.insertUser(userProfile);
        console.log('✅ Kullanıcı profili senkronize edildi');
      }
      
      if (favorites && favorites.length > 0) {
        for (const fav of favorites) {
          await this.localDB.insertUserFavorite(userId, fav.word_id);
        }
        console.log(`✅ ${favorites.length} favori kelime senkronize edildi`);
      }
      
      console.log('✅ Tüm kullanıcı verileri senkronize edildi');
    } catch (error) {
      console.error('❌ Kullanıcı veri senkronizasyon hatası:', error);
      throw error;
    }
  }

  // Giriş yapınca kelime verilerini kontrol et ve güncelle
  async checkAndUpdateWordDataOnLogin() {
    try {
      console.log('🔄 Kelime verileri kontrol ediliyor...');
      
      // Veritabanı versiyonunu kontrol et
      const currentVersion = await this.localDB.getDatabaseVersion();
      const lastUpdate = new Date(currentVersion);
      const now = new Date();
      const daysSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24);
      
      // 7 günden eskiyse güncelle
      if (daysSinceUpdate > 7) {
        console.log('📅 Kelime verileri güncel değil, güncelleniyor...');
        await this.syncDatabase();
      } else {
        console.log('✅ Kelime verileri güncel');
      }
    } catch (error) {
      console.error('❌ Kelime veri kontrol hatası:', error);
    }
  }

  // Sadece local'den favori kelimeleri getir (Supabase'e gitme)
  async getFavoriteWordsLocalOnly(userId) {
    try {
      return await this.localDB.getUserFavorites(userId);
    } catch (error) {
      console.error('Favori kelimeler getirme hatası:', error);
      return [];
    }
  }

  // Sadece local'den kullanıcı verilerini getir (Supabase'e gitme)
  async getUserDataLocalOnly(userId) {
    try {
      return await this.localDB.getUserById(userId);
    } catch (error) {
      console.error('Kullanıcı verisi getirme hatası:', error);
      return null;
    }
  }

  // Kullanıcı verilerini hibrit şekilde getir (önce local, sonra Supabase)
  async getUserData(userId) {
    try {
      // Önce local'den dene
      let userData = await this.localDB.getUserById(userId);
      if (userData) {
        return userData;
      }
      
      // Local'de yoksa Supabase'den çek ve kaydet
      console.log('📥 Kullanıcı verisi Supabase\'den indiriliyor...');
      userData = await this.supabase.getUserById(userId);
      if (userData) {
        await this.localDB.insertUser(userData);
        console.log('✅ Kullanıcı verisi local\'e kaydedildi');
        return userData;
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı veri getirme hatası:', error);
      return null;
    }
  }

  // Sadece local'den kullanıcı ilerlemesini getir (Supabase'e gitme)
  async getUserProgressLocalOnly(userId, setId) {
    try {
      return await this.localDB.getUserSetData(userId, setId);
    } catch (error) {
      console.error('İlerleme getirme hatası:', error);
      return null;
    }
  }

  // Kullanıcı kelime verilerini güncelle (hem local hem Supabase)
  async updateUserWordData(userId, setId, wordId, wordData) {
    try {
      console.log(`🔄 Kullanıcı kelime verisi güncelleniyor: User ${userId}, Set ${setId}, Word ${wordId}`);
      
      // Local'e güncelle
      await this.localDB.updateUserWordData(userId, setId, wordId, wordData);
      console.log('✅ Local veritabanında güncellendi');
      
      // Supabase'e güncelle
      try {
        await this.supabase.updateUserWordData(userId, wordId, {
          set_id: setId,
          ...wordData
        });
        console.log('✅ Supabase\'de güncellendi');
      } catch (supabaseError) {
        console.error('⚠️ Supabase güncelleme hatası (local devam ediyor):', supabaseError);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Kullanıcı kelime verisi güncelleme hatası:', error);
      throw error;
    }
  }

  // Toplu güncelleme - birden fazla kelimeyi tek seferde güncelle
  async batchUpdateUserWordData(updates) {
    try {
      console.log(`📦 Hibrit toplu güncelleme başlatılıyor: ${updates.length} kelime`);
      
      // Local için güncelleme formatını hazırla
      const localUpdates = updates.map(update => ({
        userId: update.userId,
        setId: update.setId,
        wordId: update.wordId,
        data: update.wordData
      }));
      
      // Supabase için güncelleme formatını hazırla
      const supabaseUpdates = updates.map(update => ({
        user_id: update.userId,
        word_id: update.wordId,
        set_id: update.setId,
        ...update.wordData
      }));
      
      // Paralel olarak hem local hem Supabase'e gönder
      await Promise.all([
        this.localDB.batchUpdateUserWordData(localUpdates),
        this.supabase.batchUpdateUserWordData(supabaseUpdates)
      ]);
      
      console.log(`✅ ${updates.length} kelime hibrit toplu güncellendi`);
    } catch (error) {
      console.error('❌ Hibrit toplu güncelleme hatası:', error);
      throw error;
    }
  }

  // Kullanıcı kelime verilerini getir (hibrit - önce local, sonra Supabase)
  async getUserWordData(userId, setId, wordId) {
    try {
      // Önce local'den dene
      let userWordData = await this.localDB.getUserWordData(userId, setId, wordId);
      if (userWordData) {
        return userWordData;
      }
      
      // Local'de yoksa Supabase'den çek ve kaydet
      console.log('📥 Kullanıcı kelime verisi Supabase\'den indiriliyor...');
      userWordData = await this.supabase.getUserWordData(userId, wordId, setId);
      if (userWordData) {
        await this.localDB.insertUserWordData(userWordData);
        console.log('✅ Kullanıcı kelime verisi local\'e kaydedildi');
        return userWordData;
      }
      
      return null;
    } catch (error) {
      console.error('Kullanıcı kelime veri getirme hatası:', error);
      return null;
    }
  }

  // Toplu olarak kullanıcı kelime verilerini getir (sadece local'den)
  async getAllUserWordData(userId, setId) {
    try {
      // Sadece local'den çek, Supabase'den çekme
      const userWordData = await this.localDB.getAllUserWordData(userId, setId);
      return userWordData;
    } catch (error) {
      console.error('Toplu kullanıcı kelime veri getirme hatası:', error);
      return [];
    }
  }

  // Set öğrenmeye başlandığında tüm kelimeleri user_words_data'ya ekle
  async initializeSetWordsForUser(userId, setId) {
    try {
      console.log(`🔄 Set ${setId} için kullanıcı ${userId} kelime verileri başlatılıyor...`);
      
      // Önce Set ID ile dene, sonra Category ID ile dene
      console.log(`🔍 Set ID ${setId} için kelimeler getiriliyor...`);
      let words = await this.getWordsBySetId(setId);
      console.log(`📊 Set ID ile bulunan kelimeler:`, words?.length || 0);
      
      // Eğer Set ID ile kelime bulunamazsa, Category ID olarak dene
      if (!words || words.length === 0) {
        console.log(`🔄 Set ID ile kelime bulunamadı, Category ID olarak deneniyor...`);
        words = await this.getWordsByCategoryId(setId);
        console.log(`📊 Category ID ile bulunan kelimeler:`, words?.length || 0);
      }
      
      if (!words || words.length === 0) {
        console.log('⚠️ Bu sette/kategoride kelime bulunamadı');
        return false;
      }

      console.log(`📚 ${words.length} kelime user_words_data'ya ekleniyor...`);
      console.log(`📝 İlk kelime örneği:`, words[0]);
      
      // Her kelime için user_words_data kaydı oluştur
      const wordDataPromises = words.map(async (word, index) => {
        const wordData = {
          user_id: userId,
          set_id: setId,
          word_id: word.word_id,
          is_learned: false,
          attempt_count: 0,
          correct_count: 0,
          difficulty_rating: 0,
          learned_at: null,
          last_attempt: null
        };
        
        console.log(`📝 Kelime ${index + 1}/${words.length} hazırlanıyor:`, wordData);
        try {
          await this.localDB.insertUserWordData(wordData);
          console.log(`✅ Kelime ${index + 1}/${words.length} local'e eklendi`);
        } catch (error) {
          console.error(`❌ Kelime ${index + 1}/${words.length} local'e eklenirken hata:`, error);
          throw error;
        }
      });

      // Local'e ekle
      console.log(`💾 Local veritabanına ekleniyor...`);
      await Promise.all(wordDataPromises);
      console.log(`✅ ${words.length} kelime local veritabanına eklendi`);

      // Supabase'e de ekle (batch insert)
      try {
        console.log(`☁️ Supabase'e ekleniyor...`);
        const supabaseWordData = words.map(word => ({
          user_id: userId,
          set_id: setId,
          word_id: word.word_id,
          is_learned: false,
          attempt_count: 0,
          correct_count: 0,
          learned_at: null,
          last_attempt: null,
          difficulty_rating: 0
        }));

        console.log(`📤 Supabase'e gönderilecek veri örneği:`, supabaseWordData[0]);
        await this.supabase.batchInsertUserWordData(supabaseWordData);
        console.log(`✅ ${words.length} kelime Supabase'e eklendi`);
      } catch (supabaseError) {
        console.error('⚠️ Supabase\'e ekleme hatası (local devam ediyor):', supabaseError);
      }

      console.log(`🎉 Set ${setId} için ${words.length} kelime başarıyla başlatıldı`);
      return true;
    } catch (error) {
      console.error('❌ Set kelime başlatma hatası:', error);
      throw error;
    }
  }
}

export default new HybridDatabaseService(); 