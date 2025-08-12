import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function ModernEmptyState() {
  const { themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
        <Ionicons name="book-outline" size={48} color="rgba(255,255,255,0.6)" />
      </View>
      <Text style={[styles.title, { color: '#fff' }]}>
        Henüz hikaye bulunamadı
      </Text>
      <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
        Bir kategori seçin veya arama yapın
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
