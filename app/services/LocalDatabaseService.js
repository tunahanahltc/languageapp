import * as SQLite from 'expo-sqlite';

class LocalDatabaseService {
  constructor() {
    this.db = SQLite.openDatabaseSync('languageapp.db');
    this.initDatabase();
  }

  initDatabase() {
    try {
      // Categories tablosu
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
          category_id INTEGER PRIMARY KEY,
          set_id INTEGER,
          category_name TEXT NOT NULL,
          description TEXT,
          icon TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          difficulty TEXT NOT NULL DEFAULT 'A1'
        );
      `);

      // Word sets tablosu
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS word_sets (
          set_id INTEGER PRIMARY KEY,
          set_name TEXT NOT NULL,
          difficulty TEXT,
          description TEXT,
          icon TEXT,
          color TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Words tablosu
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS words (
          word_id INTEGER PRIMARY KEY,
          category_id INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (category_id)
        );
      `);

      // Word translations tablosu
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS word_translations (
          translation_id INTEGER PRIMARY KEY,
          word_id INTEGER NOT NULL,
          language_code TEXT NOT NULL,
          word_text TEXT NOT NULL,
          meaning TEXT NOT NULL,
          example_sentence TEXT,
          example_sentence_mean TEXT,
          pronunciation TEXT,
          word_type TEXT,
          audio_url TEXT,
          image_url TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (word_id) REFERENCES words (word_id)
        );
      `);

      // User-related tables (boş olarak oluşturulacak)
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          first_name TEXT,
          last_name TEXT,
          gender TEXT,
          email TEXT NOT NULL UNIQUE,
          phone TEXT,
          profile_image TEXT,
          user_level INTEGER DEFAULT 1,
          learned_word_count INTEGER DEFAULT 0,
          experiment_score INTEGER DEFAULT 0,
          current_streak INTEGER DEFAULT 0,
          max_streak INTEGER DEFAULT 0,
          total_study_time INTEGER DEFAULT 0,
          preferred_language TEXT DEFAULT 'tr',
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS user_sets_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          set_id INTEGER,
          learned_count INTEGER DEFAULT 0,
          total_words INTEGER DEFAULT 0,
          average_score REAL DEFAULT 0.0,
          completed_at TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS user_words_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          word_id INTEGER,
          is_learned BOOLEAN DEFAULT 0,
          attempt_count INTEGER DEFAULT 0,
          correct_count INTEGER DEFAULT 0,
          learned_at TEXT,
          last_attempt TEXT,
          difficulty_rating INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS quiz_results (
          quiz_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          set_id INTEGER,
          total_questions INTEGER,
          correct_answers INTEGER,
          score REAL,
          completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          time_taken INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          word_id INTEGER,
          added_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          achievement_type TEXT,
          achievement_name TEXT,
          description TEXT,
          is_unlocked BOOLEAN DEFAULT 0,
          unlocked_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS user_study_sessions (
          session_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT,
          session_date TEXT,
          study_time INTEGER DEFAULT 0,
          words_studied INTEGER DEFAULT 0,
          correct_answers INTEGER DEFAULT 0,
          total_questions INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (user_id)
        );
      `);

      // Database version tracking
      this.db.execSync(`
        CREATE TABLE IF NOT EXISTS db_metadata (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ SQLite tabloları başarıyla oluşturuldu');
    } catch (error) {
      console.error('❌ SQLite tablo oluşturma hatası:', error);
      throw error;
    }
  }

  // Categories operations
  async insertCategories(categories) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO categories (category_id, set_id, category_name, description, icon, difficulty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      for (const category of categories) {
        await stmt.executeAsync([
          category.category_id,
          category.set_id,
          category.category_name,
          category.description,
          category.icon,
          category.difficulty,
          category.created_at,
          category.updated_at
        ]);
      }

      await stmt.finalizeAsync();
      console.log(`✅ ${categories.length} kategori eklendi`);
    } catch (error) {
      console.error('❌ Kategori ekleme hatası:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const result = await this.db.getAllAsync('SELECT * FROM categories ORDER BY category_id');
      return result;
    } catch (error) {
      console.error('❌ Kategori getirme hatası:', error);
      throw error;
    }
  }

  async getCategoriesBySetId(setId) {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM categories WHERE set_id = ? ORDER BY category_id',
        [setId]
      );
      return result;
    } catch (error) {
      console.error('❌ Set kategorileri getirme hatası:', error);
      throw error;
    }
  }

  // Word sets operations
  async insertWordSets(wordSets) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO word_sets (set_id, set_name, difficulty, description, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      for (const set of wordSets) {
        await stmt.executeAsync([
          set.set_id,
          set.set_name,
          set.difficulty,
          set.description,
          set.icon,
          set.color,
          set.created_at,
          set.updated_at
        ]);
      }

      await stmt.finalizeAsync();
      console.log(`✅ ${wordSets.length} kelime seti eklendi`);
    } catch (error) {
      console.error('❌ Kelime seti ekleme hatası:', error);
      throw error;
    }
  }

  async getWordSets() {
    try {
      const result = await this.db.getAllAsync('SELECT * FROM word_sets ORDER BY set_id');
      return result;
    } catch (error) {
      console.error('❌ Kelime setleri getirme hatası:', error);
      throw error;
    }
  }

  // Words operations
  async insertWords(words) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO words (word_id, category_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
      );

      for (const word of words) {
        await stmt.executeAsync([
          word.word_id,
          word.category_id,
          word.created_at,
          word.updated_at
        ]);
      }

      await stmt.finalizeAsync();
      console.log(`✅ ${words.length} kelime eklendi`);
    } catch (error) {
      console.error('❌ Kelime ekleme hatası:', error);
      throw error;
    }
  }

  async getWords() {
    try {
      const result = await this.db.getAllAsync('SELECT * FROM words ORDER BY word_id');
      return result;
    } catch (error) {
      console.error('❌ Kelimeleri getirme hatası:', error);
      throw error;
    }
  }

  async getWordsCountByCategoryId(categoryId) {
    try {
      const result = await this.db.getFirstAsync(
        `
        SELECT COUNT(w.word_id) AS word_count
        FROM words w
        INNER JOIN categories c ON w.category_id = c.category_id
        WHERE c.category_id = ?
        `,
        [categoryId]
      );
  
      return result?.word_count || 0;
    } catch (error) {
      console.error('❌ Kelime sayısını getirme hatası:', error);
      throw error;
    }
  }
  
  // Word translations operations
  async insertWordTranslations(translations) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO word_translations (translation_id, word_id, language_code, word_text, meaning, example_sentence, example_sentence_mean, pronunciation, word_type, audio_url, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );

      for (const translation of translations) {
        await stmt.executeAsync([
          translation.translation_id,
          translation.word_id,
          translation.language_code,
          translation.word_text,
          translation.meaning,
          translation.example_sentence,
          translation.example_sentence_mean,
          translation.pronunciation,
          translation.word_type,
          translation.audio_url,
          translation.image_url,
          translation.created_at,
          translation.updated_at
        ]);
      }

      await stmt.finalizeAsync();
      console.log(`✅ ${translations.length} çeviri eklendi`);
    } catch (error) {
      console.error('❌ Çeviri ekleme hatası:', error);
      throw error;
    }
  }

  async getAllWords() {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM word_translations WHERE language_code = ? ORDER BY created_at',
        ['en']
      );
      return result;
    } catch (error) {
      console.error('❌ Tüm kelimeleri getirme hatası:', error);
      throw error;
    }
  }

  async getWordsBySetId(setId) {
    try {
      const result = await this.db.getAllAsync(
        `SELECT wt.* FROM word_translations wt
         INNER JOIN words w ON wt.word_id = w.word_id
         INNER JOIN categories c ON w.category_id = c.category_id
         WHERE c.set_id = ? AND wt.language_code = ?
         ORDER BY wt.created_at`,
        [setId, 'en']
      );
      return result;
    } catch (error) {
      console.error('❌ Set kelimelerini getirme hatası:', error);
      throw error;
    }
  }

  // User operations
  async insertUser(userData) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO users (user_id, username, first_name, last_name, gender, email, phone, profile_image, user_level, learned_word_count, experiment_score, current_streak, max_streak, total_study_time, preferred_language, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );

      await stmt.executeAsync([
        userData.user_id,
        userData.username,
        userData.first_name,
        userData.last_name,
        userData.gender,
        userData.email,
        userData.phone,
        userData.profile_image,
        userData.user_level || 1,
        userData.learned_word_count || 0,
        userData.experiment_score || 0,
        userData.current_streak || 0,
        userData.max_streak || 0,
        userData.total_study_time || 0,
        userData.preferred_language || 'tr',
        userData.created_at || new Date().toISOString(),
        userData.updated_at || new Date().toISOString()
      ]);

      await stmt.finalizeAsync();
      console.log('✅ Kullanıcı eklendi');
    } catch (error) {
      console.error('❌ Kullanıcı ekleme hatası:', error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM users WHERE user_id = ?',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('❌ Kullanıcı getirme hatası:', error);
      throw error;
    }
  }

  // User set data operations
  async insertUserSetData(setData) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO user_sets_data (user_id, set_id, learned_count, total_words, average_score, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      await stmt.executeAsync([
        setData.user_id,
        setData.set_id,
        setData.learned_count || 0,
        setData.total_words || 0,
        setData.average_score || 0.0,
        setData.completed_at,
        setData.updated_at || new Date().toISOString()
      ]);

      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Kullanıcı set verisi ekleme hatası:', error);
      throw error;
    }
  }

  async getUserSetData(userId, setId) {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT * FROM user_sets_data WHERE user_id = ? AND set_id = ?',
        [userId, setId]
      );
      return result;
    } catch (error) {
      console.error('❌ Kullanıcı set verisi getirme hatası:', error);
      throw error;
    }
  }

  // User word data operations
  async insertUserWordData(wordData) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO user_words_data (user_id, word_id, is_learned, attempt_count, correct_count, learned_at, last_attempt, difficulty_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );

      await stmt.executeAsync([
        wordData.user_id,
        wordData.word_id,
        wordData.is_learned ? 1 : 0,
        wordData.attempt_count || 0,
        wordData.correct_count || 0,
        wordData.learned_at,
        wordData.last_attempt,
        wordData.difficulty_rating || 0
      ]);

      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Kullanıcı kelime verisi ekleme hatası:', error);
      throw error;
    }
  }

  // Quiz results operations
  async insertQuizResult(quizData) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT INTO quiz_results (user_id, set_id, total_questions, correct_answers, score, completed_at, time_taken) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );

      await stmt.executeAsync([
        quizData.user_id,
        quizData.set_id,
        quizData.total_questions,
        quizData.correct_answers,
        quizData.score,
        quizData.completed_at || new Date().toISOString(),
        quizData.time_taken || 0
      ]);

      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Quiz sonucu ekleme hatası:', error);
      throw error;
    }
  }

  // User favorites operations
  async insertUserFavorite(userId, wordId) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR IGNORE INTO user_favorites (user_id, word_id, added_at) VALUES (?, ?, ?)'
      );

      await stmt.executeAsync([userId, wordId, new Date().toISOString()]);
      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Favori ekleme hatası:', error);
      throw error;
    }
  }

  async getUserFavorites(userId) {
    try {
      const result = await this.db.getAllAsync(
        'SELECT * FROM user_favorites WHERE user_id = ? ORDER BY added_at DESC',
        [userId]
      );
      return result;
    } catch (error) {
      console.error('❌ Favorileri getirme hatası:', error);
      throw error;
    }
  }

  // Database metadata operations
  async updateDatabaseVersion(version) {
    try {
      const stmt = await this.db.prepareAsync(
        'INSERT OR REPLACE INTO db_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      );

      await stmt.executeAsync(['db_version', version, new Date().toISOString()]);
      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Veritabanı versiyonu güncelleme hatası:', error);
      throw error;
    }
  }

  async getDatabaseVersion() {
    try {
      const result = await this.db.getFirstAsync(
        'SELECT value FROM db_metadata WHERE key = ?',
        ['db_version']
      );
      return result?.value || '0';
    } catch (error) {
      console.error('❌ Veritabanı versiyonu getirme hatası:', error);
      return '0';
    }
  }

  // Clear all data (for testing or reset)
  async clearAllData() {
    try {
      this.db.execSync('DELETE FROM word_translations');
      this.db.execSync('DELETE FROM words');
      this.db.execSync('DELETE FROM categories');
      this.db.execSync('DELETE FROM word_sets');
      this.db.execSync('DELETE FROM db_metadata');
      console.log('🗑️ Veritabanı temizlendi');
    } catch (error) {
      console.error('❌ Veritabanı temizleme hatası:', error);
      throw error;
    }
  }
}

export default new LocalDatabaseService();