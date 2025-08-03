import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ThemeSelector({ currentTheme, themeColors, onPress }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tema Seçimi</Text>
      <TouchableOpacity 
        style={styles.themeButton}
        onPress={onPress}
      >
        <View style={styles.themeButtonContent}>
          <View style={styles.colorPreview}>
            <View style={[styles.colorDot, { backgroundColor: themeColors[0] }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors[1] }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors[2] }]} />
            <View style={[styles.colorDot, { backgroundColor: themeColors[3] }]} />
          </View>
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>{currentTheme.replace('_', ' ').toUpperCase()}</Text>
            <Text style={styles.themeDescription}>Mevcut tema</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  themeButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  themeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: 12,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  themeDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
});
