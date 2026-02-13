import { SQLiteDatabase } from 'expo-sqlite';
import LocalDatabase from '../db/LocalDatabase';
import { User } from '../../types';

class UserRepository {
    private db: SQLiteDatabase;

    constructor() {
        this.db = LocalDatabase.getDatabase();
    }

    async insertUser(userData: User): Promise<void> {
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
        } catch (error) {
            console.error('❌ Kullanıcı ekleme hatası:', error);
            throw error;
        }
    }

    async getUserById(userId: string): Promise<User | null> {
        try {
            const result = await this.db.getFirstAsync(
                'SELECT * FROM users WHERE user_id = ?',
                [userId]
            );
            return result as User | null;
        } catch (error) {
            console.error('❌ Kullanıcı getirme hatası:', error);
            throw error;
        }
    }
}

export default new UserRepository();
