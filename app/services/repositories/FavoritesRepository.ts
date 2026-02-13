import { SQLiteDatabase } from 'expo-sqlite';
import LocalDatabase from '../db/LocalDatabase';
import { UserFavorite } from '../../types';

class FavoritesRepository {
    private db: SQLiteDatabase;

    constructor() {
        this.db = LocalDatabase.getDatabase();
    }

    async insertUserFavorite(userId: string, wordId: number): Promise<void> {
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

    async deleteUserFavorite(userId: string, wordId: number): Promise<void> {
        try {
            const stmt = await this.db.prepareAsync(
                'DELETE FROM user_favorites WHERE user_id = ? AND word_id = ?'
            );
            await stmt.executeAsync([userId, wordId]);
            await stmt.finalizeAsync();
        } catch (error) {
            console.error('❌ Favori silme hatası:', error);
            throw error;
        }
    }

    async getUserFavorites(userId: string): Promise<UserFavorite[]> {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM user_favorites WHERE user_id = ? ORDER BY added_at DESC',
                [userId]
            );

            // Ensure added_at is a string, if not assign current date
            return (result as any[]).map(fav => ({
                ...fav,
                added_at: fav.added_at || new Date().toISOString()
            })) as UserFavorite[];
        } catch (error) {
            console.error('❌ Favorileri getirme hatası:', error);
            throw error;
        }
    }
}

export default new FavoritesRepository();
