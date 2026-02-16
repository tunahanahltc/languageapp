
import LocalDatabaseService from './LocalDatabaseService';
import { SupabaseAdapter } from './adapters/SupabaseAdapter';
import { BackendAdapter } from './interfaces/BackendAdapter';
import SyncService from './sync/SyncService';
import { User, UserSetData, UserWordData, QuizResult, UserFavorite, WordSet, Category, WordTranslation } from '../types';

interface ProgressData {
  learned_count?: number;
  total_words?: number;
  average_score?: number;
  completed_at?: string | null;
}

interface WordDataUpdate {
  userId: string;
  setId: number;
  wordId: number;
  wordData: Partial<UserWordData>;
}

interface DebugInfo {
  isInitialized: boolean;
  version: string;
  counts: {
    wordSets: number;
    categories: number;
    words: number;
    translations: number;
  };
}

class HybridDatabaseService {
  private localDB: typeof LocalDatabaseService;
  private backend: BackendAdapter;
  private syncService: SyncService;
  private isInitialized: boolean;

  constructor() {
    this.localDB = LocalDatabaseService;
    this.backend = new SupabaseAdapter();
    this.syncService = new SyncService(this.backend);
    this.isInitialized = false;
  }

  getBackend(): BackendAdapter {
    return this.backend;
  }

  async initializeDatabase(): Promise<boolean> {
    const result = await this.syncService.initializeDatabase();
    this.isInitialized = result;
    return result;
  }

  async checkDatabaseStatus(): Promise<boolean> {
    const result = await this.syncService.checkDatabaseStatus();
    this.isInitialized = result;
    return result;
  }

  async syncDatabase(): Promise<boolean> {
    return this.syncService.syncDatabase();
  }

  // --- Read Operations (Delegated to LocalDB) ---

  async getWordSets(): Promise<WordSet[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getWordSets();
  }

  async getAllWords(): Promise<WordTranslation[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getAllWords();
  }

  async getWordsBySetId(setId: number): Promise<WordTranslation[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getWordsBySetId(setId);
  }

  async getCategories(): Promise<Category[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getCategories();
  }

  async getWordCountByCategoryId(setId: number): Promise<number> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getWordsCountByCategoryId(setId);
  }

  async getWordsByCategoryId(categoryId: number): Promise<WordTranslation[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getWordsByCategoryId(categoryId);
  }

  async getCategoriesBySetId(setId: number): Promise<Category[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getCategoriesBySetId(setId);
  }

  async getRandomWords(limit: number): Promise<WordTranslation[]> {
    if (!this.isInitialized) await this.checkDatabaseStatus();
    return this.localDB.getRandomWords(limit);
  }

  // --- Hybrid Operations (Local + Backend) ---

  async getUserData(userId: string): Promise<User | null> {
    try {
      const localUser = await this.localDB.getUserById(userId);
      if (localUser) return localUser;

      const backendUser = await this.backend.getUser(userId);
      if (backendUser) {
        await this.localDB.insertUser(backendUser as any);
        return backendUser as any;
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error);
      return null;
    }
  }

  async saveUserData(userData: User): Promise<any> {
    try {
      const backendResult = await this.backend.createUser(userData);
      await this.localDB.insertUser(userData);
      return backendResult;
    } catch (error) {
      console.error('Kullanıcı kaydetme hatası:', error);
      throw error;
    }
  }

  async saveUserProgress(userId: string, setId: number, progressData: ProgressData): Promise<boolean> {
    try {
      await this.localDB.insertUserSetData({
        user_id: userId,
        set_id: setId,
        learned_count: progressData.learned_count || 0,
        total_words: progressData.total_words || 0,
        average_score: progressData.average_score || 0,
        completed_at: progressData.completed_at || null,
        updated_at: new Date().toISOString()
      });

      await this.backend.saveUserProgress(userId, setId, {
        learned_count: progressData.learned_count,
        total_words: progressData.total_words,
        average_score: progressData.average_score,
        completed_at: progressData.completed_at ?? undefined
      });
      return true;
    } catch (error) {
      console.error('İlerleme hatası:', error);
      throw error;
    }
  }

  async updateUserProgress(userId: string, setId: number, progressData: ProgressData): Promise<boolean> {
    try {
      await this.localDB.updateUserSetData(userId, setId, progressData);
      try {
        await this.backend.saveUserProgress(userId, setId, {
          learned_count: progressData.learned_count,
          total_words: progressData.total_words,
          average_score: progressData.average_score,
          completed_at: progressData.completed_at ?? undefined
        });
      } catch (backendError) {
        console.error('Backend güncelleme hatası:', backendError);
      }
      return true;
    } catch (error) {
      console.error('İlerleme güncelleme hatası:', error);
      throw error;
    }
  }

  async getAllUserWordData(userId: string, setId: number): Promise<UserWordData[]> {
    try {
      if (!this.isInitialized) await this.checkDatabaseStatus();
      return this.localDB.getAllUserWordData(userId, setId);
    } catch (error) {
      console.error('Kullanıcı kelime verilerini getirme hatası:', error);
      return [];
    }
  }

  async getUserProgress(userId: string, setId: number): Promise<UserSetData | null> {
    try {
      const localProgress = await this.localDB.getUserSetData(userId, setId);
      if (localProgress) return localProgress;

      try {
        const backendProgress = await this.backend.getUserProgress(userId, setId);
        if (backendProgress) {
          await this.localDB.insertUserSetData({
            ...backendProgress,
            learned_count: backendProgress.learned_count ?? 0,
            total_words: backendProgress.total_words ?? 0,
            average_score: backendProgress.average_score ?? 0
          } as any);
          return backendProgress as any;
        }
      } catch (backendError) {
        console.error('Backend veri hatası:', backendError);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async saveWordLearningStatus(userId: string, wordId: number, learningData: Partial<UserWordData>): Promise<boolean> {
    try {
      await this.localDB.insertUserWordData({
        user_id: userId,
        word_id: wordId,
        set_id: learningData.set_id || 0,
        is_learned: learningData.is_learned || false,
        attempt_count: learningData.attempt_count || 0,
        correct_count: learningData.correct_count || 0,
        learned_at: learningData.learned_at || null,
        last_attempt: learningData.last_attempt || null,
        difficulty_rating: learningData.difficulty_rating || 0
      });

      await this.backend.saveWordLearningStatus(userId, wordId, {
        set_id: learningData.set_id,
        is_learned: typeof learningData.is_learned === 'number'
          ? learningData.is_learned !== 0
          : learningData.is_learned ?? false,
        attempt_count: learningData.attempt_count,
        correct_count: learningData.correct_count,
        learned_at: learningData.learned_at ?? undefined,
        last_attempt: learningData.last_attempt ?? undefined,
        difficulty_rating: learningData.difficulty_rating
      });
      return true;
    } catch (error) {
      console.error('Kelime öğrenme hatası:', error);
      throw error;
    }
  }

  async batchUpdateUserWordData(updates: WordDataUpdate[]): Promise<void> {
    try {
      const localUpdates = updates.map(update => ({
        userId: update.userId,
        setId: update.setId,
        wordId: update.wordId,
        data: {
          is_learned: typeof update.wordData.is_learned === 'number'
            ? update.wordData.is_learned
            : (update.wordData.is_learned ? 1 : 0),
          attempt_count: update.wordData.attempt_count ?? 0,
          correct_count: update.wordData.correct_count ?? 0,
          learned_at: update.wordData.learned_at ?? null,
          last_attempt: update.wordData.last_attempt ?? null,
          difficulty_rating: update.wordData.difficulty_rating ?? 0
        }
      }));

      const backendUpdates = updates.map(update => ({
        user_id: update.userId,
        word_id: update.wordId,
        set_id: update.setId,
        is_learned: typeof update.wordData.is_learned === 'number'
          ? update.wordData.is_learned !== 0
          : update.wordData.is_learned ?? false,
        attempt_count: update.wordData.attempt_count,
        correct_count: update.wordData.correct_count,
        learned_at: update.wordData.learned_at ?? undefined,
        last_attempt: update.wordData.last_attempt ?? undefined,
        difficulty_rating: update.wordData.difficulty_rating
      }));

      await Promise.all([
        this.localDB.batchUpdateUserWordData(localUpdates),
        this.backend.batchSaveWordLearningStatus(backendUpdates)
      ]);
    } catch (error) {
      console.error('Hibrit toplu güncelleme hatası:', error);
      throw error;
    }
  }

  async saveFavoriteWord(userId: string, wordId: number): Promise<boolean> {
    try {
      await this.localDB.insertUserFavorite(userId, wordId);
      await this.backend.addFavorite(userId, wordId);
      return true;
    } catch (error) {
      console.error('Favori kaydetme hatası:', error);
      throw error;
    }
  }

  async removeFavoriteWord(userId: string, wordId: number): Promise<boolean> {
    try {
      await this.localDB.deleteUserFavorite(userId, wordId);
      await this.backend.removeFavorite(userId, wordId);
      return true;
    } catch (error) {
      console.error('Favori silme hatası:', error);
      throw error;
    }
  }

  async getFavoriteWords(userId: string): Promise<UserFavorite[]> {
    try {
      const localFavorites = await this.localDB.getUserFavorites(userId);
      if (localFavorites && localFavorites.length > 0) return localFavorites;

      const backendFavorites = await this.backend.getFavorites(userId);
      if (backendFavorites) {
        for (const favorite of backendFavorites) {
          await this.localDB.insertUserFavorite(userId, favorite.word_id);
        }
        return backendFavorites.map(f => ({
          ...f,
          added_at: f.added_at ?? new Date().toISOString()
        } as any));
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  async saveQuizResult(quizData: QuizResult): Promise<boolean> {
    try {
      await this.localDB.insertQuizResult(quizData);
      await this.backend.saveQuizResult(quizData);
      return true;
    } catch (error) {
      console.error('Quiz sonucu hatası:', error);
      throw error;
    }
  }

  async clearDatabase(): Promise<boolean> {
    try {
      await this.localDB.clearAllData();
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Veritabanı temizleme hatası:', error);
      throw error;
    }
  }

  async getDebugInfo(): Promise<DebugInfo | { error: string }> {
    try {
      const version = await this.localDB.getDatabaseVersion();
      const [wordSets, categories, words] = await Promise.all([
        this.localDB.getWordSets(),
        this.localDB.getCategories(),
        this.localDB.getWords()
      ]);

      return {
        isInitialized: this.isInitialized,
        version,
        counts: {
          wordSets: wordSets.length,
          categories: categories.length,
          words: words.length,
          translations: 0 // Facade'den çekmek gerekir veya repo'dan
        }
      };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  // --- Login Helpers ---

  async syncUserDataOnLogin(userId: string): Promise<void> {
    try {
      const [userProfile, favorites] = await Promise.all([
        this.backend.getUser(userId),
        this.backend.getFavorites(userId)
      ]);

      if (userProfile) await this.localDB.insertUser(userProfile as any);
      if (favorites) {
        for (const fav of favorites) await this.localDB.insertUserFavorite(userId, fav.word_id);
      }
    } catch (error) {
      console.error('Login sync hatası:', error);
      throw error;
    }
  }

  async checkAndUpdateWordDataOnLogin(): Promise<void> {
    try {
      const currentVersion = await this.localDB.getDatabaseVersion();
      const lastUpdate = new Date(currentVersion);
      const daysSinceUpdate = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 7) await this.syncDatabase();
    } catch (error) {
      console.error('Veri kontrol hatası:', error);
    }
  }

  async getFavoriteWordsLocalOnly(userId: string): Promise<UserFavorite[]> {
    try { return await this.localDB.getUserFavorites(userId); } catch { return []; }
  }

  async getUserDataLocalOnly(userId: string): Promise<User | null> {
    try { return await this.localDB.getUserById(userId); } catch { return null; }
  }

  async getUserProgressLocalOnly(userId: string, setId: number): Promise<UserSetData | null> {
    return this.localDB.getUserSetData(userId, setId);
  }

  async initializeSetWordsForUser(userId: string, setId: number): Promise<boolean> {
    try {
      let words = await this.getWordsBySetId(setId);
      if (!words || words.length === 0) words = await this.getWordsByCategoryId(setId);
      if (!words || words.length === 0) return false;

      await Promise.all(words.map(async (word) => {
        const wordData: UserWordData = {
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
        await this.localDB.insertUserWordData(wordData);
      }));

      try {
        const backendWordData = words.map(word => ({
          user_id: userId,
          set_id: setId,
          word_id: word.word_id,
          is_learned: false,
          attempt_count: 0,
          correct_count: 0,
          difficulty_rating: 0
        }));
        await this.backend.batchSaveWordLearningStatus(backendWordData);
      } catch (e) { /* ignore */ }

      return true;
    } catch (error) {
      console.error('Set başlatma hatası:', error);
      throw error;
    }
  }
}

export default new HybridDatabaseService();
