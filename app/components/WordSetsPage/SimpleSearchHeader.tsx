import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SimpleSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
}

const SimpleSearchHeader: React.FC<SimpleSearchHeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.8)" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: '#fff' }]}
          placeholder="Hikaye ara..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});

export default SimpleSearchHeader;
