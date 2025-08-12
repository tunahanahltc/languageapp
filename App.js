import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './app/contexts/ThemeContext';
import { AuthProvider, useAuth } from './app/contexts/AuthContext';
import { DataProvider } from './app/contexts/DataContext';
import TabNavigator from './app/navigation/TabNavigator';
import AuthNavigator from './app/navigation/AuthNavigator';
import { View, ActivityIndicator } from 'react-native';
import HybridDatabaseService from './app/services/HybridDatabaseService';

function NavigationWrapper() {
  const { isAuthenticated, loading } = useAuth();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);

  // Veritabanını sadece bir kez başlat
  useEffect(() => {
    let isMounted = true;
    
    const initializeDatabase = async () => {
      try {
        console.log('🚀 App başlatılıyor, veritabanı kontrol ediliyor...');
        setDbLoading(true);
        
        await HybridDatabaseService.checkDatabaseStatus();
        
        if (isMounted) {
          setDbInitialized(true);
          console.log('✅ App veritabanı hazır');
        }
      } catch (error) {
        console.error('❌ App veritabanı başlatma hatası:', error);
        if (isMounted) {
          setDbInitialized(true); // Hata olsa bile devam et
        }
      } finally {
        if (isMounted) {
          setDbLoading(false);
        }
      }
    };

    if (!dbInitialized) {
      initializeDatabase();
    }

    return () => {
      isMounted = false;
    };
  }, [dbInitialized]);

  if (loading || dbLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <NavigationContainer>
              <NavigationWrapper />
            </NavigationContainer>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}


