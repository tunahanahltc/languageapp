import React, { useState, useEffect } from 'react';
import HybridDatabaseService from '../services/HybridDatabaseService';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import WordSetsHeader from '../components/WordSetsPage/WordSetsHeader';
import CategoryFilter from '../components/WordSetsPage/CategoryFilter';
import WordSetCard from '../components/WordSetsPage/WordSetCard';
import EmptyState from '../components/WordSetsPage/EmptyState';

// Kategoriler dinamik olarak CategoryFilter'dan gelecek

export default function WordSetsPage({ navigation }) {
  const { themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [wordSets, setWordSets] = useState([]);
  const [subCategories, setSubCategories] = useState([]); // Alt kategoriler
  const [loading, setLoading] = useState(true);
  const [showSubCategories, setShowSubCategories] = useState(false);

  useEffect(() => {
    const fetchWordSets = async () => {
      try {
        setLoading(true);
        const data = await HybridDatabaseService.getWordSets();
        
        // Map the data to match the expected format
        const mapped = data?.map((set, i) => ({
          id: set.set_id,
          name: set.set_name,
          description: set.description,
          category: set.difficulty || 'A1', // Use difficulty as category
          difficulty: set.difficulty || 'A1',
          icon: set.icon || '📚',
          gradient: ['#10B981', '#3B82F6'], // Default gradient
          progress: Math.floor(Math.random() * 90) + 10, // Mock progress for now
          total: 0, // Will be calculated separately
          color: set.color || '#3b82f6',
        })) || [];
        
        // Calculate total words for each set
        const setsWithTotals = await Promise.all(
          mapped.map(async (set) => {
            try {
              const words = await HybridDatabaseService.getWordsBySetId(set.id);
              return {
                ...set,
                total: words.length
              };
            } catch (error) {
              console.error(`Error getting words for set ${set.id}:`, error);
              return set;
            }
          })
        );
        
        setWordSets(setsWithTotals);
      } catch (error) {
        console.error('Error fetching word sets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWordSets();
  }, []);

  // Kategori seçildiğinde çağrılacak
  const handleCategorySelect = async (categoryId) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'all') {
      // Tümü seçilirse normal word sets'leri göster
      setShowSubCategories(false);
      setSubCategories([]);
    } else {
      // Specific set seçilirse o setin alt kategorilerini WordSetCard olarak göster
      try {
        console.log(`📂 Set ID ${categoryId} için alt kategoriler getiriliyor...`);
        const categories = await HybridDatabaseService.getCategoriesBySetId(parseInt(categoryId));
        setSubCategories(categories);
        setShowSubCategories(categories.length > 0);
        console.log(`📂 ${categories.length} alt kategori bulundu`);
      } catch (error) {
        console.error('❌ Alt kategori getirme hatası:', error);
        setSubCategories([]);
        setShowSubCategories(false);
      }
    }
  };

  const getFilteredData = () => {
    if (selectedCategory === 'all') {
      // Tümü seçilirse word sets'leri göster
      return wordSets;
    } else if (showSubCategories && subCategories.length > 0) {
      // Bir set seçilmişse ve alt kategoriler varsa, kategorileri card olarak göster
      return subCategories.map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        description: cat.description || 'Kategori açıklaması',
        category: 'category', // Bu bir kategori olduğunu belirt
        difficulty: cat.difficulty || 'A1',
        icon: cat.icon || '📚',
        gradient: ['#10B981', '#3B82F6'],
        progress: 0, // Kategoriler için progress yok
        total: 0, // Kelime sayısı ayrıca hesaplanabilir
        color: '#3b82f6',
        isCategory: true // Bu bir kategori card'ı
      }));
    } else {
      // Seçilen set varsa ama alt kategori yoksa, o seti göster
      return wordSets.filter(set => set.id.toString() === selectedCategory);
    }
  };

  const filteredData = getFilteredData();

  if (loading) {
    return (
      <View style={styles.container}>
        <Background colors={themeColors}>
          <WordSetsHeader />
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: themeColors.text }]}>
              Kelime setleri yükleniyor...
            </Text>
          </View>
        </Background>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <WordSetsHeader />
        
                <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />



        <ScrollView style={styles.scrollview} contentContainerStyle={styles.listContainer}>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <WordSetCard
                key={item.id || index}
                wordSet={item}
                onPress={() => {
                  if (item.isCategory) {
                    // Kategori card'ına tıklandıysa, o kategorinin kelimelerine git
                    console.log(`📂 Kategori seçildi: ${item.name} (ID: ${item.id})`);
                    navigation.navigate('WordLearnScreen', { category: item });
                  } else {
                    // Normal set card'ına tıklandıysa
                    navigation.navigate('WordLearnScreen', { wordSet: item });
                  }
                }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },

});
