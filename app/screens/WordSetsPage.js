import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList, RefreshControl, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import Background from '../components/shared/Background';
import ModernHeader from '../components/WordSetsPage/ModernHeader';
import SimpleSearchHeader from '../components/WordSetsPage/SimpleSearchHeader';
import EnhancedCategoryFilter from '../components/WordSetsPage/EnhancedCategoryFilter';
import WordSetCard from '../components/WordSetsPage/WordSetCard';
import ModernEmptyState from '../components/WordSetsPage/ModernEmptyState';
import ModernLoadingState from '../components/WordSetsPage/ModernLoadingState';

const { width, height } = Dimensions.get('window');

export default function WordSetsPage({ navigation }) {
  const { themeColors } = useTheme();
  const { wordSets, allCategories, loading: dataLoading, initialized } = useData();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    if (initialized && wordSets.length > 0) {
      console.log('⚡ WordSetsPage: Veriler cache\'den anında yüklendi');
    }
  }, [initialized, wordSets]);

  // İlk seti otomatik seç
  useEffect(() => {
    if (!selectedCategory && Array.isArray(wordSets) && wordSets.length > 0) {
      const firstSetId = (wordSets[0].id ?? wordSets[0].set_id)?.toString();
      if (firstSetId) {
        setSelectedCategory(firstSetId);
        const categories = allCategories[firstSetId] || [];
        setSubCategories(categories);
        setShowSubCategories(categories.length > 0);
      }
    }
  }, [wordSets, allCategories, selectedCategory]);

  const getRandomColor = () => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCategorySelect = (categoryId) => {
    const startTime = performance.now();
    const categories = allCategories[categoryId] || [];
    setSelectedCategory(categoryId);
    setSubCategories(categories);
    setShowSubCategories(categories.length > 0);
    const endTime = performance.now();
    console.log(`⚡ UI OPTİMİZE: ${categories.length} alt kategori ${(endTime - startTime).toFixed(2)}ms'de yüklendi`);
  };

  const filteredData = useMemo(() => {
    if (!selectedCategory) return [];
    if (showSubCategories && subCategories.length > 0) {
      let filteredSubCategories = subCategories;
      if (selectedDifficulty) {
        filteredSubCategories = subCategories.filter(cat => cat.difficulty === selectedDifficulty);
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredSubCategories = filteredSubCategories.filter(cat =>
          (cat.category_name || '').toLowerCase().includes(query) ||
          (cat.description || '').toLowerCase().includes(query)
        );
      }
      return filteredSubCategories.map(cat => ({
        id: cat.category_id,
        name: cat.category_name,
        description: cat.description || '',
        category: cat.difficulty || 'A1',
        difficulty: cat.difficulty || 'A1',
        icon: cat.icon || '📚',
        gradient: ['#10B981', '#3B82F6'],
        progress: 0,
        total: 0,
        color: getRandomColor(),
        isCategory: true
      }));
    }
    return [];
  }, [selectedCategory, showSubCategories, subCategories, selectedDifficulty, searchQuery]);

  const getHeaderInfo = () => {
    if (selectedCategory && showSubCategories) {
      const selectedSet = wordSets.find(set =>
        (set.id?.toString() === selectedCategory) || (set.set_id?.toString() === selectedCategory)
      );
      if (selectedSet) {
        return {
          title: selectedSet.name || selectedSet.set_name || 'Set',
          subtitle: `${filteredData.length} hikaye`
        };
      }
    }
    return { title: 'Kütüphanem', subtitle: `${wordSets.length} set` };
  };

  const handleAddPress = () => {
    alert('Yakında: Kendi setinizi oluşturabileceksiniz! 🎯');
  };

  if (dataLoading || !initialized) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Background colors={themeColors}>
          <ModernLoadingState />
        </Background>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Background colors={themeColors}>
        <View style={styles.headerContainer}>
          <ModernHeader
            title={getHeaderInfo().title}
            subtitle={getHeaderInfo().subtitle}
            onAddPress={handleAddPress}
            onSearchPress={() => setIsSearchVisible(!isSearchVisible)}
            showAddButton={true}
            showSearchButton={true}
          />

          {isSearchVisible && (
            <SimpleSearchHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          <EnhancedCategoryFilter 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            selectedDifficulty={selectedDifficulty}
            onDifficultySelect={setSelectedDifficulty}
            allCategories={allCategories}
            wordSets={wordSets}
          />
        </View>

        <View style={styles.contentContainer}>
          <FlatList
            data={filteredData}
            renderItem={({ item, index }) => (
              <WordSetCard
                wordSet={item}
                index={index}
                onPress={() => {
                  navigation.navigate('WordLearnScreen', { wordSet: item });
                }}
              />
            )}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            initialNumToRender={6}
            windowSize={10}
            ListEmptyComponent={<ModernEmptyState />}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => {
                  setIsRefreshing(true);
                  setTimeout(() => { setIsRefreshing(false); }, 1500);
                }}
                tintColor="#fff"
                title="Yenileniyor..."
                titleColor="#fff"
              />
            }
          />
        </View>
      </Background>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: { paddingTop: StatusBar.currentHeight || 0, paddingBottom: 8 },
  contentContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollview: { flex: 1 },
  listContainer: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.15, paddingTop: 16 },
  row: { justifyContent: 'space-around', paddingHorizontal: 0 },
});