import { SQLiteDatabase } from 'expo-sqlite';
import LocalDatabase from '../db/LocalDatabase';
import { UserSetData, UserWordData, QuizResult } from '../../types';

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

class ProgressRepository {
    private db: SQLiteDatabase;

    constructor() {
        this.db = LocalDatabase.getDatabase();
    }

    // User set data operations
    async insertUserSetData(setData: UserSetData): Promise<void> {
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

    async getUserSetData(userId: string, setId: number): Promise<UserSetData | null> {
        try {
            const result = await this.db.getFirstAsync(
                'SELECT * FROM user_sets_data WHERE user_id = ? AND set_id = ?',
                [userId, setId]
            );
            return result as UserSetData | null;
        } catch (error) {
            console.error('❌ Kullanıcı set verisi getirme hatası:', error);
            throw error;
        }
    }

    async updateUserSetData(userId: string, setId: number, data: Partial<UserSetData>): Promise<void> {
        try {
            // Önce kayıt var mı kontrol et
            const existingData = await this.getUserSetData(userId, setId);

            if (existingData) {
                const stmt = await this.db.prepareAsync(
                    'UPDATE user_sets_data SET learned_count = ?, total_words = ?, average_score = ?, completed_at = ?, updated_at = ? WHERE user_id = ? AND set_id = ?'
                );
                await stmt.executeAsync([
                    data.learned_count ?? 0,
                    data.total_words ?? 0,
                    data.average_score ?? 0,
                    data.completed_at ?? null,
                    new Date().toISOString(),
                    userId,
                    setId
                ]);
                await stmt.finalizeAsync();
            } else {
                const stmt = await this.db.prepareAsync(
                    'INSERT INTO user_sets_data (user_id, set_id, learned_count, total_words, average_score, completed_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                await stmt.executeAsync([
                    userId,
                    setId,
                    data.learned_count ?? 0,
                    data.total_words ?? 0,
                    data.average_score ?? 0,
                    data.completed_at ?? null,
                    new Date().toISOString()
                ]);
                await stmt.finalizeAsync();
            }
        } catch (error) {
            console.error('❌ Kullanıcı set verisi güncelleme hatası:', error);
            throw error;
        }
    }

    async getAllUserSetData(userId: string): Promise<UserSetData[]> {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM user_sets_data WHERE user_id = ?',
                [userId]
            );
            return result as UserSetData[];
        } catch (error) {
            console.error('❌ getAllUserSetData hatası:', error);
            return [];
        }
    }

    // User word data operations
    async insertUserWordData(wordData: UserWordData): Promise<void> {
        try {
            const stmt = await this.db.prepareAsync(
                'INSERT OR REPLACE INTO user_words_data (user_id, set_id, word_id, is_learned, attempt_count, correct_count, learned_at, last_attempt, difficulty_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );

            await stmt.executeAsync([
                wordData.user_id,
                wordData.set_id,
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

    async getUserWordData(userId: string, setId: number, wordId: number): Promise<UserWordData | null> {
        try {
            const result = await this.db.getFirstAsync(
                'SELECT * FROM user_words_data WHERE user_id = ? AND set_id = ? AND word_id = ?',
                [userId, setId, wordId]
            );
            return result as UserWordData | null;
        } catch (error) {
            console.error('❌ Kullanıcı kelime verisi getirme hatası:', error);
            throw error;
        }
    }

    async getAllUserWordData(userId: string, setId: number): Promise<UserWordData[]> {
        try {
            // Yanlış formattaki verileri temizle
            await this.db.runAsync('DELETE FROM user_words_data WHERE user_id LIKE ? OR user_id LIKE ?',
                ['%user_id=%', '%set_id=%']);

            const result = await this.db.getAllAsync(
                'SELECT * FROM user_words_data WHERE user_id = ? AND set_id = ?',
                [userId, setId]
            );
            return result as UserWordData[];
        } catch (error) {
            console.error('❌ Toplu kullanıcı kelime verisi getirme hatası:', error);
            return [];
        }
    }

    async batchUpdateUserWordData(updates: UserWordDataUpdate[]): Promise<void> {
        try {
            await this.db.withTransactionAsync(async () => {
                const stmt = await this.db.prepareAsync(
                    'UPDATE user_words_data SET is_learned = ?, attempt_count = ?, correct_count = ?, difficulty_rating = ?, learned_at = ?, last_attempt = ? WHERE user_id = ? AND set_id = ? AND word_id = ?'
                );

                try {
                    for (const update of updates) {
                        await stmt.executeAsync([
                            update.data.is_learned ? 1 : 0,
                            update.data.attempt_count,
                            update.data.correct_count,
                            update.data.difficulty_rating,
                            update.data.learned_at,
                            update.data.last_attempt,
                            update.userId,
                            update.setId,
                            update.wordId
                        ]);
                    }
                } finally {
                    await stmt.finalizeAsync();
                }
            });
            console.log(`✅ ${updates.length} kelime verisi local DB'de toplu güncellendi (Transaction)`);
        } catch (error) {
            console.error('❌ Toplu local güncelleme hatası:', error);
            throw error;
        }
    }

    // Quiz results operations
    async insertQuizResult(quizData: QuizResult): Promise<void> {
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

    // Duplicate user_words_data kayıtlarını bul
    async findDuplicateUserWords(): Promise<Array<{ user_id: string; word_id: number; set_id: number; count: number }>> {
        try {
            const result = await this.db.getAllAsync(`
        SELECT user_id, word_id, set_id, COUNT(*) as count
        FROM user_words_data 
        GROUP BY user_id, word_id, set_id 
        HAVING COUNT(*) > 1
      `);
            return result as Array<{ user_id: string; word_id: number; set_id: number; count: number }>;
        } catch (error) {
            console.error('❌ Duplicate kayıt bulma hatası:', error);
            return [];
        }
    }

    // Duplicate user_words_data kayıtlarını temizle
    async cleanDuplicateUserWords(): Promise<void> {
        try {
            const duplicates = await this.findDuplicateUserWords();

            for (const duplicate of duplicates) {
                await this.db.runAsync(
                    `DELETE FROM user_words_data 
          WHERE user_id = ? AND word_id = ? AND set_id = ? 
          AND id NOT IN (
            SELECT MAX(id) 
            FROM user_words_data 
            WHERE user_id = ? AND word_id = ? AND set_id = ?
          )`,
                    [duplicate.user_id, duplicate.word_id, duplicate.set_id,
                    duplicate.user_id, duplicate.word_id, duplicate.set_id]
                );
            }
        } catch (error) {
            console.error('❌ Duplicate temizleme hatası:', error);
            throw error;
        }
    }
}

export default new ProgressRepository();
