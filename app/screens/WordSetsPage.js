import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList, RefreshControl, SafeAreaView, StatusBar, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Background from '../components/shared/Background';
import ModernHeader from '../components/WordSetsPage/ModernHeader';
import SimpleSearchHeader from '../components/WordSetsPage/SimpleSearchHeader';
import EnhancedCategoryFilter from '../components/WordSetsPage/EnhancedCategoryFilter';
import WordSetCard from '../components/WordSetsPage/WordSetCard';
import ModernEmptyState from '../components/WordSetsPage/ModernEmptyState';
import ModernLoadingState from '../components/WordSetsPage/ModernLoadingState';
import HybridDatabaseService from '../services/HybridDatabaseService';
import LocalDatabaseService from '../services/LocalDatabaseService';

const { width, height } = Dimensions.get('window');

export default function WordSetsPage({ navigation }) {
  const { themeColors } = useTheme();
  const { wordSets, allCategories, loading: dataLoading, initialized } = useData();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrollY] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [userProgressData, setUserProgressData] = useState({});

  useEffect(() => {
    if (initialized && wordSets.length > 0) {
      console.log('⚡ WordSetsPage: Veriler cache\'den anında yüklendi');
    }
  }, [initialized, wordSets]);

  // Kullanıcı progress verilerini yükle (sadece local'den)
  useEffect(() => {
    const loadUserProgress = async () => {
      if (user?.id && wordSets.length > 0) {
        console.log('📊 WordSetsPage: Local progress verileri yükleniyor...');
        try {
          const progressData = {};
          
          // Tüm user_sets_data kayıtlarını al
          const allUserSetData = await LocalDatabaseService.getAllUserSetData(user.id);
          console.log('🔍 Tüm user_sets_data kayıtları:', allUserSetData);
          
          // Her kayıt için progress verisi oluştur
          allUserSetData.forEach(userSet => {
            const setId = userSet.set_id;
            progressData[setId] = {
              learned_count: userSet.learned_count,
              total_words: userSet.total_words,
              progress_percent: userSet.average_score, // average_score zaten progress yüzdesi
              average_score: userSet.average_score,
              completed_at: userSet.completed_at
            };
          });
          
          setUserProgressData(progressData);
          console.log('✅ WordSetsPage: Local progress verileri yüklendi:', progressData);
          console.log('🔍 userProgressData keys:', Object.keys(progressData));
        } catch (error) {
          console.error('❌ WordSetsPage: Local progress verileri yüklenirken hata:', error);
        }
      }
    };

    loadUserProgress();
  }, [user?.id, wordSets]);

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
      return filteredSubCategories.map(cat => {
        // Her kategorinin kendi category_id'sini kullan
        const categoryId = parseInt(cat.category_id);
        const progressData = userProgressData[categoryId];
        
        console.log(`🔍 Progress Debug: Category ${categoryId}, Progress:`, progressData);
        
        return {
          id: cat.category_id,
          name: cat.category_name,
          description: cat.description || '',
          category: cat.difficulty || 'A1',
          difficulty: cat.difficulty || 'A1',
          icon: cat.icon || '📚',
          gradient: ['#10B981', '#3B82F6'],
          progress: progressData ? progressData.progress_percent : 0,
          total: progressData ? progressData.total_words : 0,
          learned_count: progressData ? progressData.learned_count : 0,
          color: getRandomColor(),
          isCategory: true
        };
      });
    }
    return [];
  }, [selectedCategory, showSubCategories, subCategories, selectedDifficulty, searchQuery, userProgressData]);

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
                onRefresh={async () => {
                  setIsRefreshing(true);
                  
                  // Local progress verilerini yeniden yükle
                  if (user?.id && wordSets.length > 0) {
                    try {
                      const progressData = {};
                      
                      // Tüm user_sets_data kayıtlarını al
                      const allUserSetData = await LocalDatabaseService.getAllUserSetData(user.id);
                      
                      // Her kayıt için progress verisi oluştur
                      allUserSetData.forEach(userSet => {
                        const setId = userSet.set_id;
                        progressData[setId] = {
                          learned_count: userSet.learned_count,
                          total_words: userSet.total_words,
                          progress_percent: userSet.average_score, // average_score zaten progress yüzdesi
                          average_score: userSet.average_score,
                          completed_at: userSet.completed_at
                        };
                      });
                      
                      setUserProgressData(progressData);
                      console.log('✅ Refresh: Local progress verileri güncellendi');
                    } catch (error) {
                      console.error('❌ Refresh: Local progress verileri yüklenirken hata:', error);
                    }
                  }
                  
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