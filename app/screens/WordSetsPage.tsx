import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text, FlatList, RefreshControl, SafeAreaView, StatusBar, Animated, Dimensions, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import Background from '../components/shared/Background';
import ModernHeader from '../components/WordSetsPage/ModernHeader';
import SimpleSearchHeader from '../components/WordSetsPage/SimpleSearchHeader';
import EnhancedCategoryFilter from '../components/WordSetsPage/EnhancedCategoryFilter';
import WordSetCard from '../components/WordSetsPage/WordSetCard';
import ModernEmptyState from '../components/WordSetsPage/ModernEmptyState';
import ModernLoadingState from '../components/WordSetsPage/ModernLoadingState';
import HybridDatabaseService from '../services/HybridDatabaseService';
import LocalDatabaseService from '../services/LocalDatabaseService';
import { WordSetsPageNavigationProp } from '../types';
import { WordSet } from '../types';

const { width, height } = Dimensions.get('window');

interface WordSetsPageParams {
  refresh?: boolean;
}

interface Props {
  navigation: any;
  route?: any;
}

interface SubCategory {
  category_id: number | string;
  category_name: string;
  description?: string;
  difficulty?: string;
  icon?: string;
  id?: number;
  name?: string;
  set_id?: number;
  setId?: number;
  set?: number;
}

interface FilteredDataItem {
  id: number | string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  icon: string;
  gradient: string[];
  progress: number;
  total: number;
  learned_count: number;
  color: string;
  isCategory: boolean;
  hasData: boolean;
}

interface UserProgressData {
  learned_count: number;
  total_words: number;
  progress_percent: number;
  average_score: number;
  completed_at: string | null;
}

const WordSetsPage: React.FC<Props> = ({ navigation }) => {
  const { themeColors } = useTheme();
  const { wordSets, allCategories, loading: dataLoading, initialized } = useData();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>('all');
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [showSubCategories, setShowSubCategories] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scrollY] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  const [userProgressData, setUserProgressData] = useState<Record<string | number, UserProgressData>>({});

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
          const progressData: Record<string | number, UserProgressData> = {};

          // Tüm user_sets_data kayıtlarını al
          const allUserSetData = await LocalDatabaseService.getAllUserSetData(user.id);
          console.log('🔍 Tüm user_sets_data kayıtları:', allUserSetData);

          // Her kayıt için progress verisi oluştur
          allUserSetData.forEach((userSet: any) => {
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

  // Ekranın focus olduğunda progress verilerini yenile
  useFocusEffect(
    React.useCallback(() => {
      const refreshProgress = async () => {
        if (user?.id && wordSets.length > 0) {
          console.log('🔄 WordSetsPage: Focus - Progress verileri yenileniyor...');
          try {
            const progressData: Record<string | number, UserProgressData> = {};

            const allUserSetData = await LocalDatabaseService.getAllUserSetData(user.id);

            allUserSetData.forEach((userSet: any) => {
              const setId = userSet.set_id;
              progressData[setId] = {
                learned_count: userSet.learned_count,
                total_words: userSet.total_words,
                progress_percent: userSet.average_score,
                average_score: userSet.average_score,
                completed_at: userSet.completed_at
              };
            });

            setUserProgressData(progressData);
            console.log('✅ WordSetsPage: Focus - Progress verileri güncellendi');
          } catch (error) {
            console.error('❌ WordSetsPage: Focus - Progress verileri yüklenirken hata:', error);
          }
        }
      };

      refreshProgress();
    }, [user?.id, wordSets])
  );

  // Alt kategorileri güncelle
  useEffect(() => {
    if (selectedCategory === 'all') {
      // Tüm setlerin tüm kategorilerini topla
      const allSubCats: SubCategory[] = [];
      Object.values(allCategories).forEach(cats => {
        if (Array.isArray(cats)) {
          allSubCats.push(...(cats as SubCategory[]));
        }
      });
      setSubCategories(allSubCats);
      setShowSubCategories(true);
    } else if (selectedCategory) {
      const categories = allCategories[selectedCategory] || [];
      setSubCategories(categories as SubCategory[]);
      setShowSubCategories(categories.length > 0);
    }
  }, [wordSets, allCategories, selectedCategory]);

  const getRandomColor = (): string => {
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleCategorySelect = (categoryId: string): void => {
    const startTime = performance.now();
    setSelectedCategory(categoryId);

    if (categoryId === 'all') {
      const allSubCats: SubCategory[] = [];
      Object.values(allCategories).forEach(cats => {
        if (Array.isArray(cats)) {
          allSubCats.push(...(cats as SubCategory[]));
        }
      });
      setSubCategories(allSubCats);
      setShowSubCategories(true);
    } else {
      const categories = allCategories[categoryId] || [];
      setSubCategories(categories as SubCategory[]);
      setShowSubCategories(categories.length > 0);
    }

    const endTime = performance.now();
    console.log(`⚡ UI OPTİMİZE: Filtre değişti ${(endTime - startTime).toFixed(2)}ms`);
  };

  const filteredData = useMemo((): FilteredDataItem[] => {
    if (!selectedCategory) return [];
    if (showSubCategories && subCategories.length > 0) {
      let filteredSubCategories = subCategories;
      if (selectedDifficulty && selectedDifficulty !== 'all') {
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
        const categoryId = parseInt(cat.category_id.toString());
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
          isCategory: true,
          hasData: !!progressData
        };
      });
    }
    return [];
  }, [selectedCategory, showSubCategories, subCategories, selectedDifficulty, searchQuery, userProgressData]);

  const getHeaderInfo = (): { title: string; subtitle: string } => {
    if (selectedCategory === 'all') {
      return {
        title: 'Tüm Setler',
        subtitle: `${filteredData.length} hikaye`
      };
    }
    if (selectedCategory && showSubCategories) {
      const selectedSet = wordSets.find((set: any) =>
        (set.id?.toString() === selectedCategory) || (set.set_id?.toString() === selectedCategory)
      );
      if (selectedSet) {
        return {
          title: (selectedSet as any).name || (selectedSet as any).set_name || 'Set',
          subtitle: `${filteredData.length} hikaye`
        };
      }
    }
    return { title: 'Kütüphanem', subtitle: `${wordSets.length} set` };
  };

  const handleAddPress = (): void => {
    Alert.alert('Bilgi', 'Yakında: Kendi setinizi oluşturabileceksiniz! 🎯');
  };

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);

    // Local progress verilerini yeniden yükle
    if (user?.id && wordSets.length > 0) {
      try {
        const progressData: Record<string | number, UserProgressData> = {};

        // Tüm user_sets_data kayıtlarını al
        const allUserSetData = await LocalDatabaseService.getAllUserSetData(user.id);

        // Her kayıt için progress verisi oluştur
        allUserSetData.forEach((userSet: any) => {
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
            allCategories={allCategories as any}
            wordSets={wordSets}
          />
        </View>

        <View style={styles.contentContainer}>
          <FlatList
            data={filteredData}
            renderItem={({ item, index }: { item: FilteredDataItem; index: number }) => (
              <WordSetCard
                {...({
                  wordSet: item, index, onPress: () => {
                    navigation.navigate('WordLearnScreen' as never, { wordSet: item } as never);
                  }
                } as any)}
              />
            )}
            keyExtractor={(item: FilteredDataItem, index: number) => item.id?.toString() || index.toString()}
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
                onRefresh={handleRefresh}
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
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: { paddingTop: StatusBar.currentHeight || 0, paddingBottom: 8 },
  contentContainer: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  scrollview: { flex: 1 },
  listContainer: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', paddingBottom: height * 0.15, paddingTop: 16 },
  row: { justifyContent: 'space-around', paddingHorizontal: 0 },
});

export default WordSetsPage;
