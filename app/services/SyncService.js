import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

class SyncService {
  constructor() {
    this.LAST_SYNC_KEY = 'last_sync_timestamp';
    this.DB_VERSION_KEY = 'database_version';
    this.SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat
    this.FORCE_SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 gün
  }

  // Ana sync kontrol fonksiyonu
  async shouldSync() {
    try {
      const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      const now = Date.now();
      
      if (!lastSync) {
        console.log('🔄 İlk açılış - sync gerekli');
        return { shouldSync: true, reason: 'first_time' };
      }
      
      const lastSyncTime = parseInt(lastSync);
      const timeDiff = now - lastSyncTime;
      
      // 7 günden fazla geçmişse zorla sync
      if (timeDiff > this.FORCE_SYNC_INTERVAL) {
        console.log('🔄 7 günden fazla geçmiş - zorla sync');
        return { shouldSync: true, reason: 'force_sync' };
      }
      
      // 24 saatten fazla geçmişse version kontrolü yap
      if (timeDiff > this.SYNC_INTERVAL) {
        console.log('🔍 24 saat geçmiş - version kontrolü yapılıyor...');
        const versionChanged = await this.checkDatabaseVersion();
        
        if (versionChanged) {
          console.log('🔄 Database versiyonu değişmiş - sync gerekli');
          return { shouldSync: true, reason: 'version_changed' };
        } else {
          // Version değişmemiş, sadece timestamp güncelle
          await this.updateLastSync();
          console.log('✅ Database güncel - sync gerekli değil');
          return { shouldSync: false, reason: 'up_to_date' };
        }
      }
      
      console.log('✅ Son sync yeterince yakın - skip');
      return { shouldSync: false, reason: 'recent_sync' };
      
    } catch (error) {
      console.error('❌ Sync kontrolü hatası:', error);
      // Hata durumunda güvenli tarafta kal - sync yap
      return { shouldSync: true, reason: 'error_safe' };
    }
  }

  // Veritabanı version kontrolü - TEK SUPABASE ÇAĞRISI
  async checkDatabaseVersion() {
    try {
      // Sadece version bilgisini al - minimal veri
      const { data, error } = await supabase
        .from('database_metadata')
        .select('version, updated_at')
        .single();
      
      if (error) {
        console.log('⚠️ Database metadata bulunamadı - sync gerekli');
        return true;
      }
      
      const storedVersion = await AsyncStorage.getItem(this.DB_VERSION_KEY);
      const currentVersion = data.version || data.updated_at;
      
      if (storedVersion !== currentVersion) {
        // Version değişmiş, kaydet
        await AsyncStorage.setItem(this.DB_VERSION_KEY, currentVersion);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Version kontrolü hatası:', error);
      return true; // Hata durumunda sync yap
    }
  }

  // Sync tamamlandığında çağır
  async updateLastSync() {
    try {
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, Date.now().toString());
      console.log('📝 Last sync timestamp güncellendi');
    } catch (error) {
      console.error('❌ Last sync güncelleme hatası:', error);
    }
  }

  // Force sync - cache'i temizle
  async forceSync() {
    try {
      await AsyncStorage.removeItem(this.LAST_SYNC_KEY);
      await AsyncStorage.removeItem(this.DB_VERSION_KEY);
      console.log('🔄 Cache temizlendi - force sync');
      return { shouldSync: true, reason: 'force_requested' };
    } catch (error) {
      console.error('❌ Force sync hatası:', error);
      return { shouldSync: true, reason: 'force_error' };
    }
  }

  // Sync istatistikleri
  async getSyncStats() {
    try {
      const lastSync = await AsyncStorage.getItem(this.LAST_SYNC_KEY);
      const dbVersion = await AsyncStorage.getItem(this.DB_VERSION_KEY);
      
      return {
        lastSyncTime: lastSync ? new Date(parseInt(lastSync)) : null,
        dbVersion: dbVersion,
        timeSinceLastSync: lastSync ? Date.now() - parseInt(lastSync) : null
      };
    } catch (error) {
      console.error('❌ Sync stats hatası:', error);
      return null;
    }
  }

  // Network durumunu kontrol et
  async isNetworkAvailable() {
    try {
      // Basit bir ping test
      const { data, error } = await supabase
        .from('database_metadata')
        .select('version')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.log('📶 Network mevcut değil');
      return false;
    }
  }
}

export default new SyncService();

