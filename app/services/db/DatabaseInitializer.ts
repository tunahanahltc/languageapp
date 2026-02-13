import { SQLiteDatabase } from 'expo-sqlite';

export class DatabaseInitializer {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    public initDatabase(): void {
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

            // User-related tables
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
          set_id INTEGER,
          word_id INTEGER,
          is_learned BOOLEAN DEFAULT 0,
          attempt_count INTEGER DEFAULT 0,
          correct_count INTEGER DEFAULT 0,
          learned_at TEXT,
          last_attempt TEXT,
          difficulty_rating INTEGER DEFAULT 0,
          FOREIGN KEY (user_id) REFERENCES users (user_id),
          UNIQUE(user_id, word_id, set_id)
        );
      `);

            // Migration checks (idempotent)
            try {
                this.db.execSync('ALTER TABLE user_words_data ADD COLUMN set_id INTEGER');
            } catch (e) { /* ignore */ }

            try {
                this.db.execSync('CREATE UNIQUE INDEX IF NOT EXISTS user_words_unique ON user_words_data (user_id, word_id, set_id)');
            } catch (e) { /* ignore */ }

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
        CREATE TABLE IF NOT EXISTS db_metadata (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

            console.log('✅ Veritabanı tabloları başlatıldı/kontrol edildi');
        } catch (error) {
            console.error('❌ Veritabanı başlatma hatası:', error);
            throw error;
        }
    }
}
