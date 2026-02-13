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
  const [dbInitialized, setDbInitialized] = useState<boolean>(false);
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Veritabanı bağlantısı zaten Singleton olarak LocalDatabase içinde yönetiliyor.
  // Veri indirme işlemi (Sync) artık AuthContext içinde login/register sonrası yapılıyor.
  useEffect(() => {
    setDbInitialized(true);
    setDbLoading(false);
  }, []);

  if (loading || dbLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return isAuthenticated ? <TabNavigator /> : <AuthNavigator />;
}

import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Android navigasyon çubuğunu gizle (immersive mode)
      // Çubuk kaydırınca kısa süreliğine görünür ve sonra tekrar otomaitk kapanır.
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('inset-touch');
    }
  }, []);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
