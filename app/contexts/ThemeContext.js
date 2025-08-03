import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME, getThemeColors, getBottomBarColor } from '../constants/themes';

// Tema context'i oluştur
const ThemeContext = createContext();

// Tema provider component'i
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [themeColors, setThemeColors] = useState(getThemeColors(DEFAULT_THEME));
  const [bottomBarColor, setBottomBarColor] = useState(getBottomBarColor(DEFAULT_THEME));

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
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.log('Tema yüklenirken hata:', error);
    }
  };

  // Tema değiştir ve kaydet
  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('selectedTheme', newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      console.log('Tema kaydedilirken hata:', error);
    }
  };

  // Context değerleri
  const themeContextValue = {
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
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme hook ThemeProvider içinde kullanılmalıdır');
  }
  return context;
}; 