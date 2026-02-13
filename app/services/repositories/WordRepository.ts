import { SQLiteDatabase } from 'expo-sqlite';
import LocalDatabase from '../db/LocalDatabase';
import { Word, WordSet, Category, WordTranslation } from '../../types';

class WordRepository {
    private db: SQLiteDatabase;

    constructor() {
        this.db = LocalDatabase.getDatabase();
    }

    // Categories operations
    async insertCategories(categories: Category[]): Promise<void> {
        try {
            await this.db.withTransactionAsync(async () => {
                const stmt = await this.db.prepareAsync(
                    'INSERT OR REPLACE INTO categories (category_id, set_id, category_name, description, icon, difficulty, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                );

                try {
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
                } finally {
                    await stmt.finalizeAsync();
                }
            });
        } catch (error) {
            console.error('❌ Kategori ekleme hatası:', error);
            throw error;
        }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const result = await this.db.getAllAsync('SELECT * FROM categories ORDER BY category_id');
            return result as Category[];
        } catch (error) {
            console.error('❌ Kategori getirme hatası:', error);
            throw error;
        }
    }

    async getCategoriesBySetId(setId: number): Promise<Category[]> {
        try {
            const result = await this.db.getAllAsync(
                'SELECT * FROM categories WHERE set_id = ? ORDER BY category_id',
                [setId]
            );
            return result as Category[];
        } catch (error) {
            console.error('❌ Set kategorileri getirme hatası:', error);
            throw error;
        }
    }

    // Word sets operations
    async insertWordSets(wordSets: WordSet[]): Promise<void> {
        try {
            await this.db.withTransactionAsync(async () => {
                const stmt = await this.db.prepareAsync(
                    'INSERT OR REPLACE INTO word_sets (set_id, set_name, difficulty, description, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
                );

                try {
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
                } finally {
                    await stmt.finalizeAsync();
                }
            });
        } catch (error) {
            console.error('❌ Kelime seti ekleme hatası:', error);
            throw error;
        }
    }

    async getWordSets(): Promise<WordSet[]> {
        try {
            const result = await this.db.getAllAsync('SELECT * FROM word_sets ORDER BY set_id');
            return result as WordSet[];
        } catch (error) {
            console.error('❌ Kelime setleri getirme hatası:', error);
            throw error;
        }
    }

    // Words operations
    async insertWords(words: Word[]): Promise<void> {
        try {
            await this.db.withTransactionAsync(async () => {
                const stmt = await this.db.prepareAsync(
                    'INSERT OR REPLACE INTO words (word_id, category_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
                );

                try {
                    for (const word of words) {
                        await stmt.executeAsync([
                            word.word_id,
                            word.category_id,
                            word.created_at,
                            word.updated_at
                        ]);
                    }
                } finally {
                    await stmt.finalizeAsync();
                }
            });
        } catch (error) {
            console.error('❌ Kelime ekleme hatası:', error);
            throw error;
        }
    }

    async getWords(): Promise<Word[]> {
        try {
            const result = await this.db.getAllAsync('SELECT * FROM words ORDER BY word_id');
            return result as Word[];
        } catch (error) {
            console.error('❌ Kelimeleri getirme hatası:', error);
            throw error;
        }
    }

    async getWordsCountByCategoryId(categoryId: number): Promise<number> {
        try {
            const result = await this.db.getFirstAsync(
                `SELECT COUNT(w.word_id) AS word_count
        FROM words w
        INNER JOIN categories c ON w.category_id = c.category_id
        WHERE c.category_id = ?`,
                [categoryId]
            ) as { word_count: number } | null;

            const count = result?.word_count || 0;
            console.log(`🔍 Repository: Category ${categoryId} için ${count} kelime bulundu`);
            return count;
        } catch (error) {
            console.error('❌ Kelime sayısını getirme hatası:', error);
            throw error;
        }
    }

    // Word translations operations
    async insertWordTranslations(translations: WordTranslation[]): Promise<void> {
        try {
            await this.db.withTransactionAsync(async () => {
                const stmt = await this.db.prepareAsync(
                    'INSERT OR REPLACE INTO word_translations (translation_id, word_id, language_code, word_text, meaning, example_sentence, example_sentence_mean, pronunciation, word_type, audio_url, image_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
                );

                try {
                    for (const translation of translations) {
                        await stmt.executeAsync([
                            translation.translation_id,
                            translation.word_id,
                            translation.language_code || 'en',
                            translation.word_text,
                            translation.meaning,
                            translation.example_sentence ?? null,
                            translation.example_sentence_mean ?? null,
                            translation.pronunciation ?? null,
                            translation.word_type ?? null,
                            translation.audio_url ?? null,
                            translation.image_url ?? null,
                            translation.created_at ?? new Date().toISOString(),
                            translation.updated_at ?? new Date().toISOString()
                        ]);
                    }
                } finally {
                    await stmt.finalizeAsync();
                }
            });
        } catch (error) {
            console.error('❌ Çeviri ekleme hatası:', error);
            throw error;
        }
    }

    async getAllWords(): Promise<WordTranslation[]> {
        try {
            // Dil filtresini kaldırıyoruz (durum kontrolü için kullanılıyor)
            const result = await this.db.getAllAsync(
                'SELECT * FROM word_translations ORDER BY created_at'
            );
            return result as WordTranslation[];
        } catch (error) {
            console.error('❌ Tüm kelimeleri getirme hatası:', error);
            throw error;
        }
    }

    async getWordsBySetId(setId: number): Promise<WordTranslation[]> {
        try {
            // Önce tercih edilen dili ('en') dene
            let result = await this.db.getAllAsync(
                `SELECT wt.* FROM word_translations wt
         INNER JOIN words w ON wt.word_id = w.word_id
         INNER JOIN categories c ON w.category_id = c.category_id
         WHERE c.set_id = ? AND (wt.language_code = 'en' OR wt.language_code = 'en-US')
         ORDER BY wt.created_at`,
                [setId]
            );

            // Eğer 'en' bulunamazsa, mevcut herhangi bir dili getir
            if (result.length === 0) {
                console.log(`⚠️ Set ${setId} için 'en' çeviri bulunamadı, herhangi bir dil aranıyor...`);
                result = await this.db.getAllAsync(
                    `SELECT wt.* FROM word_translations wt
           INNER JOIN words w ON wt.word_id = w.word_id
           INNER JOIN categories c ON w.category_id = c.category_id
           WHERE c.set_id = ?
           ORDER BY wt.created_at`,
                    [setId]
                );
            }

            return result as WordTranslation[];
        } catch (error) {
            console.error('❌ Set kelimelerini getirme hatası:', error);
            throw error;
        }
    }

    async getWordsByCategoryId(categoryId: number): Promise<WordTranslation[]> {
        try {
            // Önce tercih edilen dili ('en') dene
            let result = await this.db.getAllAsync(
                `SELECT wt.* FROM word_translations wt
         INNER JOIN words w ON wt.word_id = w.word_id
         INNER JOIN categories c ON w.category_id = c.category_id
         WHERE c.category_id = ? AND (wt.language_code = 'en' OR wt.language_code = 'en-US')
         ORDER BY wt.created_at`,
                [categoryId]
            );

            // Eğer 'en' bulunamazsa, mevcut herhangi bir dili getir
            if (result.length === 0) {
                console.log(`⚠️ Kategori ${categoryId} için 'en' çeviri bulunamadı, herhangi bir dil aranıyor...`);
                result = await this.db.getAllAsync(
                    `SELECT wt.* FROM word_translations wt
           INNER JOIN words w ON wt.word_id = w.word_id
           INNER JOIN categories c ON w.category_id = c.category_id
           WHERE c.category_id = ?
           ORDER BY wt.created_at`,
                    [categoryId]
                );
            }

            console.log(`🔍 Repository: Category ${categoryId} için ${result.length} çeviri döndürülüyor`);
            return result as WordTranslation[];
        } catch (error) {
            console.error('❌ Set kelimelerini getirme hatası:', error);
            throw error;
        }
    }
}

export default new WordRepository();
