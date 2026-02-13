
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../config/supabase'; // TODO: Abstract this auth listener later
import HybridDatabaseService from '../services/HybridDatabaseService';
import { useData } from './DataContext';

interface UserProfile {
  user_id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  phone?: string;
  user_level?: number;
  learned_word_count?: number;
  experiment_score?: number;
  current_streak?: number;
  max_streak?: number;
  total_study_time?: number;
  preferred_language?: string;
  created_at?: string;
}

interface RegisterData {
  username?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
}

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, userData: RegisterData) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  isAuthenticated: boolean;
  databaseReady: boolean;
  syncCounter: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [syncCounter, setSyncCounter] = useState(0);

  // Access the backend adapter
  const backend = HybridDatabaseService.getBackend();

  useEffect(() => {
    // Mevcut kullanıcıyı kontrol et
    checkUser();

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Sadece önemli state değişikliklerini logla
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          console.log('Auth state changed:', event, session?.user?.id);
        }

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await backend.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
        await ensureDatabaseReady();
      }
    } catch (error: any) {
      if (error.message?.includes('Auth session missing')) {
        console.log('No active session found');
      } else {
        console.error('Error checking user:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      // Önce local'den kontrol et
      let profile = await HybridDatabaseService.getUserDataLocalOnly(userId);

      // Eğer local'de veri yoksa Backend'den indir (ilk giriş)
      if (!profile) {
        console.log('🔄 İlk giriş tespit edildi, kullanıcı profili Backend\'den indiriliyor...');
        profile = await HybridDatabaseService.getUserData(userId);
      }

      if (profile) {
        setUserProfile(profile as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const ensureDatabaseReady = async () => {
    try {
      console.log('⚙️ Veritabanı ve içerik kontrol ediliyor...');
      const isReady = await HybridDatabaseService.checkDatabaseStatus();

      if (!isReady) {
        console.log('📋 İlk kurulum gerekli, veritabanı başlatılıyor...');
        await HybridDatabaseService.initializeDatabase();
        setDatabaseReady(true);
        console.log('✅ İçerik hazırlığı tamamlandı');
      } else {
        setDatabaseReady(true);
        console.log('✅ Veritabanı hazır, arka planda güncellemeler kontrol ediliyor...');
        // Arka planda senkronizasyon yap (bloklamadan)
        HybridDatabaseService.syncDatabase().then(() => {
          console.log('🔄 Arka plan senkronizasyonu tamamlandı');
          setSyncCounter(prev => prev + 1);
        }).catch(err => {
          console.warn('⚠️ Arka plan senkronizasyon hatası:', err);
        });
      }
    } catch (error) {
      console.error('❌ Veritabanı hazırlık hatası:', error);
    }
  };

  const register = async (email: string, password: string, userData: RegisterData) => {
    try {
      setLoading(true);

      // Backend Auth ile kullanıcı oluştur
      const authResult = await backend.register(email, password, userData);
      console.log('Auth result:', authResult);

      if (authResult.error) throw authResult.error;
      if (!authResult.data || !authResult.data.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // Kullanıcı oluşturuldu, şimdi veritabanını hazırla (ilk kurulum)
      // Kullanıcıya "Hazırlanıyor" ekranı göstermek için loading true kalabilir veya ayrı bir state eklenebilir.
      // Şimdilik loading içinde hallediyoruz.
      await ensureDatabaseReady();

      // Users tablosuna kullanıcı bilgilerini ekle
      const profileData: UserProfile = {
        user_id: authResult.data.user.id,
        email: email,
        username: userData.username || email.split('@')[0],
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        gender: userData.gender || '',
        phone: userData.phone || '',
        user_level: 1,
        learned_word_count: 0,
        experiment_score: 0,
        current_streak: 0,
        max_streak: 0,
        total_study_time: 0,
        preferred_language: 'tr'
      };

      console.log('Creating user profile:', profileData);
      await backend.createUser(profileData);
      await loadUserProfile(authResult.data.user.id);

      return authResult;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.trace('Who is calling login?');
      setLoading(true);
      const authResult = await backend.login(email, password);
      console.log('Login auth result:', authResult);

      if (authResult.error) throw authResult.error;
      if (!authResult.user) {
        throw new Error('Giriş başarısız');
      }

      if (authResult.user) {
        // Giriş başarılı, veritabanını kontrol et
        await ensureDatabaseReady();

        // Giriş yapınca kelime verilerini kontrol et
        // Optimization: Delta sync is now handled within this function
        await HybridDatabaseService.checkAndUpdateWordDataOnLogin();

        // Kullanıcı profilini yükle (ilk giriş kontrolü dahil)
        await loadUserProfile(authResult.user.id);

        // Kullanıcı seviyesini kontrol et (Örn: 0 = Free, 1 = Premium/Registered)
        // Şimdilik varsayılan olarak tüm giriş yapanları senkronize ediyoruz.
        // İleride buraya 'if (user.level > 0)' gibi bir kontrol eklenebilir.
        const profile = await HybridDatabaseService.getUserDataLocalOnly(authResult.user.id);

        // Eğer local profil yoksa veya senkronizasyon gerekiyorsa
        if (!profile) {
          console.log('🔄 İlk giriş için tüm kullanıcı verileri senkronize ediliyor...');
          await HybridDatabaseService.syncUserDataOnLogin(authResult.user.id);
        }
      }

      return authResult;
    } catch (error: any) {
      if (!error.message?.includes('Invalid login credentials') || !user) {
        console.error('Login error:', error);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await backend.logout();
      setUser(null);
      setUserProfile(null);
      setDatabaseReady(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      if (!userProfile) throw new Error('No user profile');

      const updatedProfile = { ...userProfile, ...updates };
      setUserProfile(updatedProfile);

      // Update in backend
      // Note: We need to implement updateUser in backend adapter mostly to persist changes
      await backend.updateUser(userProfile.user_id, updates);

      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    databaseReady,
    syncCounter
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loading && (
        <React.Fragment>
          {/* Opsiyonel: Burada global bir overlay/loading gösterilebilir */}
        </React.Fragment>
      )}
    </AuthContext.Provider>
  );
};
