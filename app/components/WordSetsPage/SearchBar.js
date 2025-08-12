import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Ara...",
  onClear 
}) {
  const { themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
      <Ionicons name="search" size={20} color="rgba(255,255,255,0.7)" style={styles.searchIcon} />
      <TextInput
        style={[styles.input, { color: '#fff' }]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={onClear || (() => onSearchChange(''))} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});
