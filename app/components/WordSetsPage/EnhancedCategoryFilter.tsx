import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Modal, Dimensions, StyleProp, ViewStyle, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface WordSet {
  id?: number;
  set_id?: number;
  name?: string;
  set_name?: string;
  difficulty?: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
  setId?: number;
  difficulty?: string;
  color: string;
}

interface DifficultyLevel {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

interface EnhancedCategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
  selectedDifficulty: string | null;
  onDifficultySelect: (difficultyId: string) => void;
  allCategories?: any[];
  wordSets: WordSet[];
}

const difficultyLevels: DifficultyLevel[] = [
  { id: 'all', name: 'Tümü', emoji: '🌈', color: '#6366F1' },
  { id: 'A1', name: 'Başlangıç', emoji: '🌱', color: '#10B981' },
  { id: 'A2', name: 'Temel', emoji: '🎓', color: '#3B82F6' },
  { id: 'B1', name: 'Orta', emoji: '📚', color: '#F59E0B' },
  { id: 'B2', name: 'Orta-İleri', emoji: '🎯', color: '#EF4444' },
  { id: 'C1', name: 'İleri', emoji: '⭐', color: '#8B5CF6' },
  { id: 'C2', name: 'Üst', emoji: '🏆', color: '#EC4899' }
];

const EnhancedCategoryFilter: React.FC<EnhancedCategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
  selectedDifficulty,
  onDifficultySelect,
  allCategories,
  wordSets
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'categories' | 'difficulties'>('categories');
  const [selectedSet, setSelectedSet] = useState<Category | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  const getSetEmoji = (setName: string, difficulty?: string): string => {
    const name = (setName || '').toLowerCase();

    // Özel set isimleri için ikonlar
    if (name.includes('genel kelimeler') || name.includes('general words')) return '📝';
    if (name.includes('akademik kelimeler') || name.includes('academic words')) return '🎓';
    if (name.includes('önemli setler') || name.includes('important sets')) return '⭐';
    if (name.includes('temel kelimeler') || name.includes('basic words')) return '🔰';
    if (name.includes('günlük konuşma') || name.includes('daily conversation')) return '💬';
    if (name.includes('iş kelimeleri') || name.includes('business words')) return '💼';
    if (name.includes('seyahat kelimeleri') || name.includes('travel words')) return '✈️';
    if (name.includes('yemek kelimeleri') || name.includes('food words')) return '🍽️';
    if (name.includes('aile kelimeleri') || name.includes('family words')) return '👨‍👩‍👧‍👦';
    if (name.includes('renk kelimeleri') || name.includes('color words')) return '🎨';
    if (name.includes('sayı kelimeleri') || name.includes('number words')) return '🔢';
    if (name.includes('hayvan kelimeleri') || name.includes('animal words')) return '🐾';

    // Genel kategoriler
    if (name.includes('günlük') || name.includes('daily')) return '📅';
    if (name.includes('iş') || name.includes('business') || name.includes('work')) return '💼';
    if (name.includes('yemek') || name.includes('food') || name.includes('restaurant')) return '🍽️';
    if (name.includes('seyahat') || name.includes('travel') || name.includes('turizm')) return '✈️';
    if (name.includes('aile') || name.includes('family')) return '👨‍👩‍👧‍👦';
    if (name.includes('spor') || name.includes('sport') || name.includes('futbol')) return '⚽';
    if (name.includes('müzik') || name.includes('music')) return '🎵';
    if (name.includes('okul') || name.includes('school') || name.includes('eğitim')) return '🎓';
    if (name.includes('teknoloji') || name.includes('tech') || name.includes('bilgisayar')) return '💻';
    if (name.includes('temel') || name.includes('basic') || name.includes('başlangıç')) return '🔰';

    // Zorluk seviyesine göre fallback ikonlar
    const difficultyEmojis: Record<string, string> = {
      'A1': '🌱', 'A2': '🎓', 'B1': '📚',
      'B2': '🎯', 'C1': '⭐', 'C2': '🏆'
    };
    return difficultyEmojis[difficulty || ''] || '📖';
  };

  const getSetColor = (difficulty?: string): string => {
    const colors: Record<string, string> = {
      'A1': '#10B981', 'A2': '#3B82F6', 'B1': '#F59E0B',
      'B2': '#EF4444', 'C1': '#8B5CF6', 'C2': '#EC4899'
    };
    return colors[difficulty || ''] || '#6B7280';
  };

  useEffect(() => {
    if (Array.isArray(wordSets)) {
      const allOption: Category = {
        id: 'all',
        name: 'Tümü',
        emoji: '🌈',
        setId: -1,
        difficulty: 'all',
        color: '#6366F1'
      };

      if (wordSets.length > 0) {
        const setCategoriesArray = wordSets.map(set => ({
          id: (set.id ?? set.set_id)?.toString() || '',
          name: set.name ?? set.set_name ?? 'İsimsiz Set',
          emoji: getSetEmoji((set.name ?? set.set_name ?? ''), set.difficulty),
          setId: set.id ?? set.set_id,
          difficulty: set.difficulty,
          color: getSetColor(set.difficulty)
        }));
        setCategories([allOption, ...setCategoriesArray]);
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        setCategories([allOption]);
        setLoading(false);
      }
    }
  }, [wordSets, fadeAnim]);

  const toggleModal = (type: 'categories' | 'difficulties' = 'categories', set: Category | null = null) => {
    if (isModalOpen) {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalOpen(false);
        if (!selectedSet) {
          setModalType('categories');
        }
      });
    } else {
      if (selectedSet && !type) {
        setModalType('difficulties');
      } else if (type) {
        setModalType(type);
      }
      if (set) setSelectedSet(set);
      setIsModalOpen(true);
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSetSelect = (set: Category) => {
    setSelectedSet(set);
    setModalType('difficulties');
  };

  const handleDifficultySelect = (difficulty: string) => {
    onDifficultySelect(difficulty);
    if (selectedSet) {
      onCategorySelect(selectedSet.id);
    }
    toggleModal();
  };

  const getSelectedInfo = () => {
    if (!selectedCategory || selectedCategory === 'all') {
      if (selectedDifficulty && selectedDifficulty !== 'all') {
        const diffLevel = difficultyLevels.find(d => d.id === selectedDifficulty);
        return { name: `Tümü - ${diffLevel?.name || ''}`, emoji: diffLevel?.emoji || '🌈', color: diffLevel?.color || '#6366F1' };
      }
      return { name: 'Tümü', emoji: '🌈', color: '#6366F1' };
    }

    const selected = categories.find(cat => cat.id === selectedCategory);
    if (!selected) return { name: 'Set Seçin', emoji: '📚', color: '#6B7280' };

    if (selectedDifficulty && selectedDifficulty !== 'all') {
      const diffLevel = difficultyLevels.find(d => d.id === selectedDifficulty);
      return {
        name: `${selected.name} - ${diffLevel?.name || ''}`,
        emoji: diffLevel?.emoji || selected.emoji,
        color: diffLevel?.color || selected.color
      };
    }

    return {
      name: selected.name,
      emoji: selected.emoji,
      color: selected.color
    };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingButton}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </View>
    );
  }

  if (!loading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingButton}>
          <Text style={styles.loadingText}>Set bulunamadı</Text>
        </View>
      </View>
    );
  }

  const selectedInfo = getSelectedInfo();

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => toggleModal()}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
          style={styles.buttonGradient}
        >
          <View style={styles.selectedContent}>
            <View style={[styles.selectedIcon, { backgroundColor: selectedInfo.color }]}>
              <Text style={styles.selectedEmoji}>{selectedInfo.emoji}</Text>
            </View>
            <Text style={styles.selectedText}>{selectedInfo.name}</Text>
          </View>
          <Text style={styles.arrowIcon}>⌄</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={isModalOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => toggleModal()}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => toggleModal()}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0]
                    })
                  },
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1]
                    })
                  }
                ],
                opacity: modalAnim
              }
            ]}
          >
            <View style={styles.modalHeader}>
              {modalType === 'difficulties' && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setModalType('categories');
                    setSelectedSet(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backButtonText}>← Geri</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.modalTitle}>
                {modalType === 'categories' ? '📚 Set Seçin' : '🎯 Zorluk Seviyesi'}
              </Text>
              {modalType === 'difficulties' && (
                <View style={{ width: 60 }} />
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsGrid}
            >
              {modalType === 'categories' ? (
                categories.map((category, index) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.optionItem,
                      selectedCategory === category.id && {
                        ...styles.selectedItem,
                        borderColor: category.color + 'CC'
                      },
                      { marginLeft: index % 2 === 0 ? 0 : 8 }
                    ]}
                    onPress={() => handleSetSelect(category)}
                    activeOpacity={1}
                  >
                    <LinearGradient
                      colors={
                        selectedCategory === category.id
                          ? [category.color + '30', category.color + '15']
                          : ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.90)']
                      }
                      style={styles.optionGradient}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: category.color }]}>
                        <Text style={styles.optionEmoji}>{category.emoji}</Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        selectedCategory === category.id && { color: category.color, fontWeight: '700' }
                      ]}>
                        {category.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                difficultyLevels.map((level, index) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.optionItem,
                      selectedDifficulty === level.id && {
                        ...styles.selectedItem,
                        borderColor: level.color + 'CC'
                      },
                      { marginLeft: index % 2 === 0 ? 0 : 8 }
                    ]}
                    onPress={() => handleDifficultySelect(level.id)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        selectedDifficulty === level.id
                          ? [level.color + '30', level.color + '15']
                          : ['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.90)']
                      }
                      style={styles.optionGradient}
                    >
                      <View style={[styles.optionIcon, { backgroundColor: level.color }]}>
                        <Text style={styles.optionEmoji}>{level.emoji}</Text>
                      </View>
                      <Text style={[
                        styles.optionText,
                        selectedDifficulty === level.id && { color: level.color, fontWeight: '700' }
                      ]}>
                        {level.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  selectedEmoji: {
    fontSize: 18,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 8,
  },
  loadingButton: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 32,
    maxHeight: '75%',
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  modalHeader: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,250,251,0.8)',
  },
  backButton: {
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  backButtonText: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  optionsGrid: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionItem: {
    width: (width - 72) / 2 - 8,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  selectedItem: {
    transform: [{ scale: 1.02 }],
    borderWidth: 2.5,
  },
  optionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 4,
  },
});

export default EnhancedCategoryFilter;
