import React, { useState, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import WordSetsHeader from '../components/WordSetsPage/WordSetsHeader';
import CategoryFilter from '../components/WordSetsPage/CategoryFilter';
import WordSetCard from '../components/WordSetsPage/WordSetCard';
import EmptyState from '../components/WordSetsPage/EmptyState';


// Kategoriler sabit kalacak
const categories = [
  { id: 'all', name: 'Tümü', icon: 'list' },
  { id: 'temel', name: 'Temel Setler', icon: 'graduation-cap' },
  { id: 'sinav', name: 'Sınava Hazırlık', icon: 'book' },
  { id: 'onemli', name: 'Önemli Setler', icon: 'star' },
];

export default function WordSetsPage({ navigation }) {
  const { themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wordSets, setWordSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDB = async () => {
      await DatabaseService.setupDatabase();
      const sets = await DatabaseService.getWordSets();
      // Dummy renklendirme ve kategori ekleyelim
      const colorList = [
        '#ec4899', '#3b82f6', '#22c55e', '#a21caf', '#f97316',
        '#ef4444', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#6366f1', '#84cc16'
      ];
      const catList = ['temel', 'sinav', 'onemli'];
      const mapped = sets.map((set, i) => ({
        ...set,
        name: set.setName,
        progress: Math.floor(Math.random() * 90) + 10,
        total: Math.floor(Math.random() * 50) + 10,
        color: colorList[i % colorList.length],
        category: catList[i % catList.length],
      }));
      setWordSets(mapped);
      setLoading(false);
    };
    initDB();
  }, []);

  const getFilteredWordSets = () => {
    if (selectedCategory === 'all') return wordSets;
    return wordSets.filter(set => set.category === selectedCategory);
  };

  const filteredWordSets = getFilteredWordSets();

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <WordSetsHeader />
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <ScrollView style={styles.scrollview} contentContainerStyle={styles.listContainer}>
          {filteredWordSets.length > 0 ? (
            filteredWordSets.map((set, index) => (
              <WordSetCard
                key={index}
                wordSet={set}
                categories={categories}
                onPress={() => navigation.navigate('WordLearnScreen', { wordSet: set })}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </ScrollView>
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollview: {
    margin: 10,
    marginBottom: 50
  },
  listContainer: {
    paddingBottom: 80,
  },
});
