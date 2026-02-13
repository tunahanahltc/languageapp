import LocalDatabaseService from '../LocalDatabaseService';
import { BackendAdapter } from '../interfaces/BackendAdapter';

class SyncService {
    private backend: BackendAdapter;
    // LocalDatabaseService is currently a singleton/facade, so we use it directly or inject it.
    // Ideally sync logic should use repositories directly, but to keep it simple and reuse existing inserts:
    private localDB: typeof LocalDatabaseService;

    constructor(backend: BackendAdapter) {
        this.backend = backend;
        this.localDB = LocalDatabaseService;
    }

    async initializeDatabase(): Promise<boolean> {
        try {
            console.log('🔄 Veritabanı başlatılıyor...');

            const syncData = await this.backend.getAllData();

            console.log(`📥 İndirilen veriler: ${syncData.categories.length} kategori, ${syncData.wordSets.length} kelime seti, ${syncData.words.length} kelime, ${syncData.translations.length} çeviri`);

            // Perform inserts sequentially to avoid transaction conflicts
            await this.localDB.insertCategories(syncData.categories.map((c: any) => ({
                ...c,
                description: c.description ?? null
            })));

            await this.localDB.insertWordSets(syncData.wordSets.map((ws: any) => ({
                ...ws,
                difficulty: ws.difficulty ?? null
            })));

            await this.localDB.insertWords(syncData.words.map((w: any) => ({
                ...w,
                created_at: w.created_at ?? new Date().toISOString()
            })));

            await this.localDB.insertWordTranslations(syncData.translations.map((t: any) => ({
                ...t,
                example_sentence: t.example_sentence ?? null
            })));

            await this.localDB.updateDatabaseVersion(syncData.timestamp);
            await this.localDB.cleanDuplicateUserWords();

            console.log('✅ Veritabanı başarıyla başlatıldı');
            return true;
        } catch (error) {
            console.error('❌ Veritabanı başlatma hatası:', error);
            throw error;
        }
    }

    async syncDatabase(): Promise<boolean> {
        try {
            console.log('🔄 Veritabanı senkronizasyonu başlatılıyor...');

            const currentVersion = await this.localDB.getDatabaseVersion();
            let syncData;

            if (currentVersion && currentVersion !== '0') {
                console.log(`📅 Delta Sync başlatılıyor (Son sürüm: ${currentVersion})...`);
                syncData = await this.backend.getUpdates(currentVersion);
            } else {
                console.log('📅 Full Sync başlatılıyor...');
                syncData = await this.backend.getAllData();
            }

            // Perform inserts sequentially to avoid transaction conflicts
            await this.localDB.insertCategories(syncData.categories.map((c: any) => ({
                ...c,
                description: c.description ?? null
            })));

            await this.localDB.insertWordSets(syncData.wordSets.map((ws: any) => ({
                ...ws,
                difficulty: ws.difficulty ?? null
            })));

            await this.localDB.insertWords(syncData.words.map((w: any) => ({
                ...w,
                created_at: w.created_at ?? new Date().toISOString()
            })));

            await this.localDB.insertWordTranslations(syncData.translations.map((t: any) => ({
                ...t,
                example_sentence: t.example_sentence ?? null
            })));

            await this.localDB.updateDatabaseVersion(syncData.timestamp);

            console.log('✅ Veritabanı senkronizasyonu tamamlandı');
            return true;
        } catch (error) {
            console.error('❌ Veritabanı senkronizasyon hatası:', error);
            throw error;
        }
    }

    async checkDatabaseStatus(): Promise<boolean> {
        try {
            console.log('🔍 Veritabanı durumu kontrol ediliyor...');

            const version = await this.localDB.getDatabaseVersion();
            const [wordSets, categories, words, translations] = await Promise.all([
                this.localDB.getWordSets(),
                this.localDB.getCategories(),
                this.localDB.getWords(),
                this.localDB.getAllWords()
            ]);

            console.log(`📊 Mevcut veri durumu: ${wordSets.length} set, ${categories.length} kategori, ${words.length} kelime, ${translations.length} çeviri`);

            const hasData = version !== '0' &&
                wordSets.length > 0 &&
                categories.length > 0 &&
                words.length > 0 &&
                translations.length > 0;

            if (!hasData) {
                console.log('📋 Veritabanı boş veya eksik (Çeviriler kontrol edildi).');
                return false;
            }

            console.log('✅ Veritabanı verileri mevcut');
            return true;
        } catch (error) {
            console.error('❌ Veritabanı durumu kontrol hatası:', error);
            console.log('❌ Veritabanı durumu kontrol edilemedi.');
            return false;
        }
    }
}

export default SyncService;
