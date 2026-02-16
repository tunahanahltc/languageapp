import LocalDatabase from './db/LocalDatabase';
import { DatabaseInitializer } from './db/DatabaseInitializer';
import WordRepository from './repositories/WordRepository';
import UserRepository from './repositories/UserRepository';
import ProgressRepository from './repositories/ProgressRepository';
import FavoritesRepository from './repositories/FavoritesRepository';
import {
  Category,
  WordSet,
  Word,
  WordTranslation,
  User,
  UserSetData,
  UserWordData,
  QuizResult,
  UserFavorite
} from '../types';

interface UserWordDataUpdate {
  userId: string;
  setId: number;
  wordId: number;
  data: {
    is_learned: boolean | number;
    attempt_count: number;
    correct_count: number;
    difficulty_rating: number;
    learned_at: string | null;
    last_attempt: string | null;
  };
}

class LocalDatabaseService {
  constructor() {
    const db = LocalDatabase.getDatabase();
    const initializer = new DatabaseInitializer(db);
    initializer.initDatabase();
  }

  // --- Deletion Operations ---
  async deleteUserFavorite(userId: string, wordId: number): Promise<void> {
    return FavoritesRepository.deleteUserFavorite(userId, wordId);
  }

  // --- Category Operations ---
  async insertCategories(categories: Category[]): Promise<void> {
    return WordRepository.insertCategories(categories);
  }

  async getCategories(): Promise<Category[]> {
    return WordRepository.getCategories();
  }

  async getCategoriesBySetId(setId: number): Promise<Category[]> {
    return WordRepository.getCategoriesBySetId(setId);
  }

  // --- Word Set Operations ---
  async insertWordSets(wordSets: WordSet[]): Promise<void> {
    return WordRepository.insertWordSets(wordSets);
  }

  async getWordSets(): Promise<WordSet[]> {
    return WordRepository.getWordSets();
  }

  // --- Word Operations ---
  async insertWords(words: Word[]): Promise<void> {
    return WordRepository.insertWords(words);
  }

  async getWords(): Promise<Word[]> {
    return WordRepository.getWords();
  }

  async getWordsCountByCategoryId(categoryId: number): Promise<number> {
    return WordRepository.getWordsCountByCategoryId(categoryId);
  }

  // --- Word Translation Operations ---
  async insertWordTranslations(translations: WordTranslation[]): Promise<void> {
    return WordRepository.insertWordTranslations(translations);
  }

  async getAllWords(): Promise<WordTranslation[]> {
    return WordRepository.getAllWords();
  }

  async getWordsBySetId(setId: number): Promise<WordTranslation[]> {
    return WordRepository.getWordsBySetId(setId);
  }

  async getWordsByCategoryId(categoryId: number): Promise<WordTranslation[]> {
    return WordRepository.getWordsByCategoryId(categoryId);
  }

  async getRandomWords(limit: number): Promise<WordTranslation[]> {
    return WordRepository.getRandomWords(limit);
  }

  // --- User Operations ---
  async insertUser(userData: User): Promise<void> {
    return UserRepository.insertUser(userData);
  }

  async getUserById(userId: string): Promise<User | null> {
    return UserRepository.getUserById(userId);
  }

  // --- User Set Data Operations ---
  async insertUserSetData(setData: UserSetData): Promise<void> {
    return ProgressRepository.insertUserSetData(setData);
  }

  async getUserSetData(userId: string, setId: number): Promise<UserSetData | null> {
    return ProgressRepository.getUserSetData(userId, setId);
  }

  async updateUserSetData(userId: string, setId: number, data: Partial<UserSetData>): Promise<void> {
    return ProgressRepository.updateUserSetData(userId, setId, data);
  }

  async getAllUserSetData(userId: string): Promise<UserSetData[]> {
    return ProgressRepository.getAllUserSetData(userId);
  }

  async getIsExistUserSetData(userId: string, setId: number): Promise<boolean> {
    const userData = await ProgressRepository.getUserSetData(userId, setId);
    return userData !== null;
  }

  // --- User Word Data Operations ---
  async insertUserWordData(wordData: UserWordData): Promise<void> {
    return ProgressRepository.insertUserWordData(wordData);
  }

  async getUserWordData(userId: string, setId: number, wordId: number): Promise<UserWordData | null> {
    return ProgressRepository.getUserWordData(userId, setId, wordId);
  }

  async getAllUserWordData(userId: string, setId: number): Promise<UserWordData[]> {
    return ProgressRepository.getAllUserWordData(userId, setId);
  }

  async updateUserWordData(userId: string, setId: number, wordId: number, data: Partial<UserWordData>): Promise<void> {
    // This legacy method signature maps to the batch update structure or direct update
    // For simplicity, we can use batch update with one item or a direct update in repository if we added it.
    // ProgressRepository doesn't have a direct 'updateUserWordData' yet, let's add it or use batch.
    // Based on previous implementation, let's use batchUpdate since it's flexible.

    return ProgressRepository.batchUpdateUserWordData([{
      userId,
      setId,
      wordId,
      data: {
        is_learned: data.is_learned ?? 0,
        attempt_count: data.attempt_count ?? 0,
        correct_count: data.correct_count ?? 0,
        difficulty_rating: data.difficulty_rating ?? 0,
        learned_at: data.learned_at ?? null,
        last_attempt: data.last_attempt ?? null
      }
    }]);
  }

  async batchUpdateUserWordData(updates: UserWordDataUpdate[]): Promise<void> {
    return ProgressRepository.batchUpdateUserWordData(updates);
  }

  async deleteUserWordData(userId: string, setId: number, wordId: number): Promise<void> {
    // Check if this method exists in repository, if not add it or execute directly.
    // ProgressRepository missed this. Adding inline query or TODO.
    // For now, let's access DB directly via LocalDatabase instance if needed or add to Repo.
    // Better to add to Repo.
    const db = LocalDatabase.getDatabase();
    const stmt = await db.prepareAsync(
      'DELETE FROM user_words_data WHERE user_id = ? AND set_id = ? AND word_id = ?'
    );
    await stmt.executeAsync([userId, setId, wordId]);
    await stmt.finalizeAsync();
  }

  // --- Quiz Results Operations ---
  async insertQuizResult(quizData: QuizResult): Promise<void> {
    return ProgressRepository.insertQuizResult(quizData);
  }

  // --- User Favorites Operations ---
  async insertUserFavorite(userId: string, wordId: number): Promise<void> {
    return FavoritesRepository.insertUserFavorite(userId, wordId);
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return FavoritesRepository.getUserFavorites(userId);
  }

  // --- Database Metadata Operations ---
  async updateDatabaseVersion(version: string): Promise<void> {
    const db = LocalDatabase.getDatabase();
    try {
      const stmt = await db.prepareAsync(
        'INSERT OR REPLACE INTO db_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      );
      await stmt.executeAsync(['db_version', version, new Date().toISOString()]);
      await stmt.finalizeAsync();
    } catch (error) {
      console.error('❌ Veritabanı versiyonu güncelleme hatası:', error);
      throw error;
    }
  }

  async getDatabaseVersion(): Promise<string> {
    const db = LocalDatabase.getDatabase();
    try {
      const result = await db.getFirstAsync(
        'SELECT value FROM db_metadata WHERE key = ?',
        ['db_version']
      ) as { value: string } | null;
      return result?.value || '0';
    } catch (error) {
      console.error('❌ Veritabanı versiyonu getirme hatası:', error);
      return '0';
    }
  }

  // --- Maintenance Operations ---
  async clearAllData(): Promise<void> {
    const db = LocalDatabase.getDatabase();
    try {
      // Tabloları sırayla düşür (Foreign Key kısıtlamalarına dikkat ederek)
      db.execSync('DROP TABLE IF EXISTS user_words_data');
      db.execSync('DROP TABLE IF EXISTS user_sets_data');
      db.execSync('DROP TABLE IF EXISTS user_favorites');
      db.execSync('DROP TABLE IF EXISTS quiz_results');
      db.execSync('DROP TABLE IF EXISTS word_translations');
      db.execSync('DROP TABLE IF EXISTS words');
      db.execSync('DROP TABLE IF EXISTS categories');
      db.execSync('DROP TABLE IF EXISTS word_sets');
      db.execSync('DROP TABLE IF EXISTS users');
      db.execSync('DROP TABLE IF EXISTS db_metadata');

      console.log('🗑️ Veritabanı tabloları silindi');

      // Veritabanını yeniden başlat
      const initializer = new DatabaseInitializer(db);
      initializer.initDatabase();
      console.log('✅ Veritabanı sıfırdan başlatıldı');
    } catch (error) {
      console.error('❌ Veritabanı sıfırlama hatası:', error);
      throw error;
    }
  }

  async findDuplicateUserWords(): Promise<Array<{ user_id: string; word_id: number; set_id: number; count: number }>> {
    return ProgressRepository.findDuplicateUserWords();
  }

  async cleanDuplicateUserWords(): Promise<void> {
    return ProgressRepository.cleanDuplicateUserWords();
  }
}

export default new LocalDatabaseService();
