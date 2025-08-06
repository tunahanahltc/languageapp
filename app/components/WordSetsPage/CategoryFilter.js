import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import HybridDatabaseService from '../../services/HybridDatabaseService';

// Default kategoriler (her zaman görünür)

export default function CategoryFilter({ selectedCategory, onCategorySelect }) {
  const [categories, setCategories] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Word sets'leri al (filtrelerde set isimleri gösterilecek)
      const wordSets = await HybridDatabaseService.getWordSets();
      
      // Set'leri kategori formatına dönüştür
      const setCategoriesArray = wordSets.map(set => {
        console.log(`🔄 Set işleniyor: ID=${set.set_id}, Name=${set.set_name}, Difficulty=${set.difficulty}`);
        return {
          id: set.set_id.toString(), // Set ID'si kategori ID'si olacak
          name: set.set_name || 'İsimsiz Set',
          emoji: getSetEmoji(set.difficulty),
          setId: set.set_id, // Set ID'sini ayrıca saklayalım
          difficulty: set.difficulty
        };
      });

      // Default kategoriyi ekle + set kategorileri
      const allCategories = [
        ...setCategoriesArray.sort((a, b) => a.name.localeCompare(b.name))
      ];

      setCategories(allCategories);
      console.log(`📋 ${allCategories.length} kategori yüklendi (${setCategoriesArray.length} set)`);
    } catch (error) {
      console.error('❌ Kategori yükleme hatası:', error);
      // Hata durumunda default kategorileri kullan
      setCategories();
    } finally {
      setLoading(false);
    }
  };

  const getSetEmoji = (difficulty) => {
    // difficulty "A1-C2", "B1", vs. olabilir
    if (!difficulty) return '📖';
    
    const emojis = {
      'A1': '🌱',
      'A2': '🎓', 
      'B1': '📚',
      'B2': '🎯',
      'C1': '⭐',
      'C2': '🏆'
    };
    
    // Eğer tam eşleşme varsa onu kullan
    if (emojis[difficulty]) {
      return emojis[difficulty];
    }
    
    // Eğer "A1-C2" gibi bir aralık ise, ilk seviyeyi al
    if (difficulty.includes('-')) {
      const firstLevel = difficulty.split('-')[0];
      return emojis[firstLevel] || '📖';
    }
    
    return '📖';
  };

  if (loading) {
    return (
      <View style={styles.filterContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
        </View>
      </View>
    );
  }

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
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
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
