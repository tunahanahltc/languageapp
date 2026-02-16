import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, getThemeColors, getBottomBarColor } from '../constants/themes';
import { ThemeType, ThemeColors } from '../types';

interface ThemeContextType {
  currentTheme: ThemeType;
  themeColors: ThemeColors;
  bottomBarColor: string;
  changeTheme: (newTheme: ThemeType) => Promise<void>;
}

// Tema context'i oluştur
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Tema provider component'i
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(DEFAULT_THEME);
  const [themeColors, setThemeColors] = useState<ThemeColors>(getThemeColors(DEFAULT_THEME));
  const [bottomBarColor, setBottomBarColor] = useState<string>(getBottomBarColor(DEFAULT_THEME));

  // AsyncStorage'dan tema yükle
  useEffect(() => {
    loadTheme();
  }, []);

  // Tema değiştiğinde renkleri güncelle
  useEffect(() => {
    setThemeColors(getThemeColors(currentTheme));
    setBottomBarColor(getBottomBarColor(currentTheme));
  }, [currentTheme]);

  // AsyncStorage'dan tema yükle
  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && isValidTheme(savedTheme)) {
        setCurrentTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.log('Tema yüklenirken hata:', error);
    }
  };

  // Tema geçerli mi kontrol et
  const isValidTheme = (theme: string): boolean => {
    // Tüm geçerli temaların listesi
    const validThemes: string[] = [
      'minimal', 'gece',
      'macera', 'gunbatimi', 'altin',
      'doga', 'nane', 'okyanus',
      'kraliyet', 'lavanta', 'seker', 'buz'
    ];
    return validThemes.includes(theme);
  };

  // Tema değiştir ve kaydet
  const changeTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('selectedTheme', newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      console.log('Tema kaydedilirken hata:', error);
    }
  };

  // Context değerleri
  const themeContextValue: ThemeContextType = {
    currentTheme,
    themeColors,
    bottomBarColor,
    changeTheme,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Tema hook'u
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme hook ThemeProvider içinde kullanılmalıdır');
  }
  return context;
};
