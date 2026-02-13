import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions, Platform, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign, Feather } from "@expo/vector-icons";
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import { PracticeScreenNavigationProp } from '../types';
import { BlurView } from "expo-blur"; // Note: Ensure expo-blur is installed, or use a fallback. We'll simulate glass without it for broader compatibility if needed, but opacity works well.

const { width } = Dimensions.get("window");

// --- Interfaces ---

interface PracticeActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5' | 'AntDesign' | 'Feather';
  category: string;
  colors: readonly [string, string, ...string[]];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface IconComponentProps {
  iconType: PracticeActivity['iconType'];
  name: string;
  size: number;
  color: string;
}

interface PracticeScreenProps {
  navigation: PracticeScreenNavigationProp;
}

// --- Data ---

const practiceActivities: PracticeActivity[] = [
  {
    id: "word-race",
    title: "Kelime Yarışı",
    description: "Zamana karşı yarış! Doğru anlamı en hızlı sen bul.",
    icon: "zap",
    iconType: "Feather",
    category: "games",
    colors: ["#FF9966", "#FF5E62"],
    difficulty: 'Medium',
  },
  {
    id: "wordle-tr",
    title: "Wordle",
    description: "Günün kelimesini 6 denemede bulabilir misin?",
    icon: "grid",
    iconType: "Feather",
    category: "games",
    colors: ["#56CCF2", "#2F80ED"],
    difficulty: 'Hard',
  },
  {
    id: "hangman",
    title: "Adam Asmaca",
    description: "Klasik kelime tahmin oyunu. Harfleri dikkatli seç!",
    icon: "life-buoy",
    iconType: "Feather",
    category: "games",
    colors: ["#A770EF", "#CF8BF3", "#FDB99B"],
    difficulty: 'Easy',
  },
  {
    id: "word-match",
    title: "Eşleştirme",
    description: "Kartları çevir, kelimeleri eşleştir, hafızanı test et.",
    icon: "copy",
    iconType: "Feather",
    category: "games",
    colors: ["#11998e", "#38ef7d"],
    difficulty: 'Easy',
  },
  {
    id: "translation",
    title: "Çeviri Testi",
    description: "Cümlelerin doğru çevirisini seçenekler arasından bul.",
    icon: "globe",
    iconType: "Feather",
    category: "tests",
    colors: ["#ee0979", "#ff6a00"],
    difficulty: 'Medium',
  },
  {
    id: "listening",
    title: "Dinleme",
    description: "Duyduğun kelimeyi veya cümleyi doğru yaz.",
    icon: "headphones",
    iconType: "Feather",
    category: "practice",
    colors: ["#FC466B", "#3F5EFB"],
    difficulty: 'Hard',
  },
  {
    id: "speaking",
    title: "Konuşma",
    description: "Telaffuzunu geliştir. Konuş ve anında geri bildirim al.",
    icon: "mic",
    iconType: "Feather",
    category: "practice",
    colors: ["#00b09b", "#96c93d"],
    difficulty: 'Hard',
  },
];

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'games', label: 'Oyunlar' },
  { id: 'tests', label: 'Testler' },
  { id: 'practice', label: 'Alıştırma' },
];

const wordSetLabels: Record<string, string> = {
  all: "Tüm Kelimeler",
  learned: "Öğrendiklerim",
  favorites: "Favorilerim",
  unlearned: "Öğrenmediklerim",
  set1: "Sıfatlar 101",
  set2: "Günlük Konuşma",
};

// --- Components ---

const IconComponent: React.FC<IconComponentProps> = ({ iconType, name, size, color }) => {
  const IconLib = {
    Ionicons,
    MaterialIcons,
    FontAwesome5,
    AntDesign,
    Feather,
  }[iconType];

  return <IconLib name={name as any} size={size} color={color} />;
};

// --- Main Screen ---

const PracticeScreen: React.FC<PracticeScreenProps> = ({ navigation }) => {
  const { themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showWordSetModal, setShowWordSetModal] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<PracticeActivity | null>(null);
  const [selectedWordSet, setSelectedWordSet] = useState<string>("all");

  const filteredActivities = selectedCategory === 'all'
    ? practiceActivities
    : practiceActivities.filter(a => a.category === selectedCategory);

  const handleStartPractice = (activity: PracticeActivity) => {
    setSelectedActivity(activity);
    setShowWordSetModal(true);
  };

  const startPracticeWithWordSet = () => {
    setShowWordSetModal(false);
    if (selectedActivity) {
      // @ts-ignore
      navigation.navigate('GameScreen', {
        gameId: selectedActivity.id,
        gameTitle: selectedActivity.title,
        gameType: selectedActivity.category,
        wordSet: selectedWordSet,
        themeColors: selectedActivity.colors
      });
    }
    setSelectedActivity(null);
  };

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <View style={styles.contentContainer}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Merhaba, Tunahan 👋</Text>
              <Text style={styles.subtitleText}>Bugün ne çalışmak istersin?</Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <LinearGradient colors={['#FF9966', '#FF5E62']} style={styles.profileGradient}>
                <Text style={styles.profileInitials}>TK</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.categoryTab,
                      isActive && styles.categoryTabActive
                    ]}
                  >
                    <Text style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Activities Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.activitiesScroll}
          >
            <View style={styles.activitiesGrid}>
              {filteredActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => handleStartPractice(activity)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']}
                    style={styles.cardGradient}
                  >
                    <View style={styles.cardIconContainer}>
                      <LinearGradient colors={activity.colors} style={styles.iconBackground}>
                        <IconComponent iconType={activity.iconType} name={activity.icon} size={24} color="white" />
                      </LinearGradient>
                      <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{activity.difficulty}</Text>
                      </View>
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle}>{activity.title}</Text>
                      <Text style={styles.cardDescription} numberOfLines={2}>{activity.description}</Text>
                    </View>

                    <View style={styles.playButton}>
                      <Text style={styles.playButtonText}>Oyna</Text>
                      <Feather name="arrow-right" size={16} color="#4B5563" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>

        </View>

        {/* Word Set Modal - Simplified & Modernized */}
        <Modal
          visible={showWordSetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWordSetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Seçimi</Text>
                <TouchableOpacity onPress={() => setShowWordSetModal(false)} style={styles.modalClose}>
                  <Feather name="x" size={24} color="#1F2937" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>Bu oyunu hangi kelime grubuyla oynamak istersin?</Text>

              <ScrollView style={styles.modalOptionsList} showsVerticalScrollIndicator={false}>
                {Object.entries(wordSetLabels).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.modalOption,
                      selectedWordSet === value && styles.modalOptionSelected
                    ]}
                    onPress={() => setSelectedWordSet(value)}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedWordSet === value && styles.modalOptionTextSelected
                    ]}>{label}</Text>
                    {selectedWordSet === value && (
                      <Feather name="check-circle" size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.modalStartButton} onPress={startPracticeWithWordSet}>
                <LinearGradient colors={selectedActivity?.colors || ['#3b82f6', '#6d28d9']} style={styles.modalStartGradient}>
                  <Text style={styles.modalStartText}>Başla</Text>
                  <Feather name="play" size={20} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  profileButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInitials: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },

  // Categories
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryTabActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  categoryTextActive: {
    color: '#2563EB',
    fontWeight: 'bold',
  },

  // Activities
  activitiesScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  activityCard: {
    width: (width - 56) / 2, // 20 padding left + 20 padding right + 16 gap = 56
    borderRadius: 24,
    // Overflow visible for shadow if needed, but inner gradient needs radius
  },
  cardGradient: {
    padding: 16,
    borderRadius: 24,
    minHeight: 180,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  playButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  modalOptionsList: {
    maxHeight: 300,
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalStartButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalStartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  modalStartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PracticeScreen;
