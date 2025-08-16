import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser,
  createUser,
  getUserById 
} from '../services/SupabaseService';
import HybridDatabaseService from '../services/HybridDatabaseService';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await loadUserProfile(currentUser.id);
      }
    } catch (error) {
      // AuthSessionMissingError normal bir durum, kullanıcı giriş yapmamış
      if (error.message?.includes('Auth session missing')) {
        console.log('No active session found');
      } else {
        console.error('Error checking user:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId) => {
    try {
      // Sadece local'den oku (giriş yapılmışsa zaten güncel)
      const profile = await HybridDatabaseService.getUserDataLocalOnly(userId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Profil yüklenemezse kullanıcıyı null yapma, sadece log'la
    }
  };

  const register = async (email, password, userData) => {
    try {
      setLoading(true);
      
      // Supabase Auth ile kullanıcı oluştur
      const authResult = await signUp(email, password, userData);
      console.log('Auth result:', authResult);
      
      if (authResult.error) throw authResult.error;
      if (!authResult.data || !authResult.data.user) {
        throw new Error('Kullanıcı oluşturulamadı');
      }

      // Users tablosuna kullanıcı bilgilerini ekle
      const profileData = {
        user_id: authResult.data.user.id, // Bu UUID string
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
      await createUser(profileData);
      await loadUserProfile(authResult.data.user.id);

      return authResult;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const authResult = await signIn(email, password);
      console.log('Login auth result:', authResult);
      
      if (authResult.error) throw authResult.error;
      if (!authResult.data || !authResult.data.user) {
        throw new Error('Giriş başarısız');
      }
      
      if (authResult.data.user) {
        // Giriş yapınca kelime verilerini kontrol et
        await HybridDatabaseService.checkAndUpdateWordDataOnLogin();
        
        // Giriş yapınca tüm kullanıcı verilerini senkronize et
        await HybridDatabaseService.syncUserDataOnLogin(authResult.data.user.id);
        await loadUserProfile(authResult.data.user.id);
      }
      
      return authResult;
    } catch (error) {
      // Sadece gerçek hataları logla, auth state değişikliklerini değil
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
      await signOut();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!userProfile) throw new Error('No user profile');
      
      const updatedProfile = await updateUser(userProfile.user_id, updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 