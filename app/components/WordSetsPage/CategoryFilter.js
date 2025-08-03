import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const categories = [
  { id: 'all', name: 'Tümü', emoji: '📋' },
  { id: 'temel', name: 'Temel Setler', emoji: '🎓' },
  { id: 'sinav', name: 'Sınava Hazırlık', emoji: '📚' },
  { id: 'onemli', name: 'Önemli Setler', emoji: '⭐' },
];

export default function CategoryFilter({ selectedCategory, onCategorySelect }) {
  return (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterButton,
              selectedCategory === category.id && styles.activeFilterButton
            ]}
            onPress={() => onCategorySelect(category.id)}
          >
            <Text style={{ 
              fontSize: 16,
              marginRight: 6 
            }}>
              {category.emoji}
            </Text>
            <Text style={[
              styles.filterText,
              selectedCategory === category.id && styles.activeFilterText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.8)',
  },
  filterText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#1e293b',
    fontWeight: '600',
  },
});
