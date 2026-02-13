import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5, AntDesign } from "@expo/vector-icons";
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import { PracticeScreenNavigationProp } from '../types';

const { width } = Dimensions.get("window");

interface PracticeActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5' | 'AntDesign';
  category: string;
  colors: readonly [string, string, ...string[]];
}

interface IconComponentProps {
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome5' | 'AntDesign';
  name: string;
  size: number;
  color: string;
}

interface PracticeScreenProps {
  navigation: PracticeScreenNavigationProp;
}

const practiceActivities: PracticeActivity[] = [
  {
    id: "word-race",
    title: "Kelime Yarışı",
    description: "Hızlıca çıkan kelimelerin anlamını seç",
    icon: "flash",
    iconType: "Ionicons",
    category: "games",
    colors: ["#f59e0b", "#ea580c", "#dc2626"] as const,
  },
  {
    id: "wordle-tr",
    title: "Wordle",
    description: "5 harfli kelimeyi 6 denemede tahmin et",
    icon: "brain",
    iconType: "FontAwesome5",
    category: "games",
    colors: ["#10b981", "#14b8a6", "#06b6d4"] as const,
  },
  {
    id: "hangman",
    title: "Adam Asmaca",
    description: "Harfleri tahmin ederek kelimeyi bul",
    icon: "game-controller",
    iconType: "Ionicons",
    category: "games",
    colors: ["#8b5cf6", "#a855f7", "#6366f1"] as const,
  },
  {
    id: "word-match",
    title: "Kelime Eşleştirme",
    description: "Türkçe ve İngilizce kelimeleri eşleştir",
    icon: "gps-fixed",
    iconType: "MaterialIcons",
    category: "games",
    colors: ["#3b82f6", "#6366f1", "#8b5cf6"] as const,
  },
  {
    id: "translation",
    title: "Çeviri Testi",
    description: "Türkçe-İngilizce çeviri yaparak test ol",
    icon: "shuffle",
    iconType: "Ionicons",
    category: "tests",
    colors: ["#f43f5e", "#ec4899", "#dc2626"] as const,
  },
  {
    id: "comprehensive-test",
    title: "Kapsamlı Test",
    description: "Tüm becerilerini test eden karma sorular",
    icon: "trophy",
    iconType: "Ionicons",
    category: "tests",
    colors: ["#eab308", "#f59e0b", "#ea580c"] as const,
  },
  {
    id: "listening",
    title: "Dinleme",
    description: "Kelimenin telaffuzunu dinle ve seç",
    icon: "volume-high",
    iconType: "Ionicons",
    category: "practice",
    colors: ["#06b6d4", "#3b82f6", "#6366f1"] as const,
  },
  {
    id: "speaking",
    title: "Konuşma",
    description: "Kelimeleri doğru telaffuz et",
    icon: "mic",
    iconType: "Ionicons",
    category: "practice",
    colors: ["#ec4899", "#f43f5e", "#dc2626"] as const,
  },
  {
    id: "sentence-practice",
    title: "Cümlelerle Öğren",
    description: "Kelimeleri cümle içinde kullan",
    icon: "book",
    iconType: "Ionicons",
    category: "practice",
    colors: ["#14b8a6", "#10b981", "#059669"] as const,
  },
];

const categoryLabels: Record<string, string> = {
  games: "Oyunlar",
  tests: "Testler",
  practice: "Pratik",
};

const categoryIcons: Record<string, { name: string; type: 'Ionicons' | 'MaterialIcons' }> = {
  games: { name: "game-controller", type: "Ionicons" },
  tests: { name: "trophy", type: "Ionicons" },
  practice: { name: "gps-fixed", type: "MaterialIcons" },
};

const wordSetLabels: Record<string, string> = {
  all: "Tüm Kelimeler",
  learned: "Öğrendiklerim",
  favorites: "Favorilerim",
  unlearned: "Öğrenmediklerim",
  set1: "Set 1: Temel Kelimeler",
  set2: "Set 2: Orta Seviye",
};

const IconComponent: React.FC<IconComponentProps> = ({ iconType, name, size, color }) => {
  switch (iconType) {
    case "Ionicons":
      return <Ionicons name={name as any} size={size} color={color} />;
    case "MaterialIcons":
      return <MaterialIcons name={name as any} size={size} color={color} />;
    case "FontAwesome5":
      return <FontAwesome5 name={name} size={size} color={color} />;
    case "AntDesign":
      return <AntDesign name={name as any} size={size} color={color} />;
    default:
      return <Ionicons name={name as any} size={size} color={color} />;
  }
};

const PracticeScreen: React.FC<PracticeScreenProps> = ({ navigation }) => {
  const { themeColors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showWordSetModal, setShowWordSetModal] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<PracticeActivity | null>(null);
  const [selectedWordSet, setSelectedWordSet] = useState<string>("all");

  const filteredActivities: PracticeActivity[] = selectedCategory
    ? practiceActivities.filter((activity) => activity.category === selectedCategory)
    : [];

  const handleCategorySelect = (category: string): void => {
    setSelectedCategory(category);
  };

  const handleBackToCategories = (): void => {
    setSelectedCategory(null);
  };

  const handleStartPractice = (activity: PracticeActivity): void => {
    setSelectedActivity(activity);
    setShowWordSetModal(true);
  };

  const startPracticeWithWordSet = (): void => {
    console.log(`Starting ${selectedActivity?.title} with ${selectedWordSet}`);
    setShowWordSetModal(false);
    setSelectedActivity(null);
    // Here you would navigate to the actual practice component
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors[0] }]}>
      <Background colors={themeColors}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {/* Profile Avatar */}
            <View style={styles.profileContainer}>
              <LinearGradient colors={["#3b82f6", "#6d28d9"]} style={styles.avatar}>
                <Ionicons name="person" size={24} color="white" />
              </LinearGradient>
            </View>

            {/* Streak Counter */}
            <LinearGradient colors={["#ea580c", "#dc2626"]} style={styles.streakContainer}>
              <Ionicons name="flame" size={20} color="white" />
              <Text style={styles.streakText}>7</Text>
            </LinearGradient>

            {/* Gems and Hearts */}
            <View style={styles.statsContainer}>
              <LinearGradient colors={["#3b82f6", "#06b6d4"]} style={styles.statItem}>
                <Ionicons name="diamond" size={16} color="white" />
                <Text style={styles.statText}>250</Text>
              </LinearGradient>
              <LinearGradient colors={["#ec4899", "#dc2626"]} style={styles.statItem}>
                <Ionicons name="heart" size={16} color="white" />
                <Text style={styles.statText}>5</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Title Section */}
          {selectedCategory && (
            <View style={styles.titleSection}>
              <TouchableOpacity
                onPress={handleBackToCategories}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color="#374151" />
              </TouchableOpacity>

              <Text style={styles.title}>
                {categoryLabels[selectedCategory]}
              </Text>
            </View>
          )}

          {/* Statistics Section */}
          {!selectedCategory && (
            <View style={styles.statsSection}>
              <LinearGradient colors={["#f8fafc", "#e0f2fe"]} style={styles.statsCard}>
                <View style={styles.statsHeader}>
                  <LinearGradient colors={["#f59e0b", "#ea580c"]} style={styles.statsIcon}>
                    <Ionicons name="star" size={24} color="white" />
                  </LinearGradient>
                  <Text style={styles.statsTitle}>İstatistiklerim</Text>
                </View>
                <View style={styles.statsGrid}>
                  <View style={[styles.statCard, { backgroundColor: "#E8F5E8" }]}>
                    <Text style={[styles.statValue, { color: "#22C55E" }]}>156</Text>
                    <Text style={styles.statLabel}>Öğrenilen</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: "#FCE7F3" }]}>
                    <Text style={[styles.statValue, { color: "#EC4899" }]}>23</Text>
                    <Text style={styles.statLabel}>Favori</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: "#F3E8FF" }]}>
                    <Text style={[styles.statValue, { color: "#8B5CF6" }]}>12</Text>
                    <Text style={styles.statLabel}>Oyun</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: "#FEF3C7" }]}>
                    <Text style={[styles.statValue, { color: "#F97316" }]}>%87</Text>
                    <Text style={styles.statLabel}>Başarı</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Category Buttons */}
          {!selectedCategory && (
            <View style={styles.categoriesGrid}>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <TouchableOpacity key={value} onPress={() => handleCategorySelect(value)} style={styles.categoryButton}>
                  <LinearGradient
                    colors={
                      value === "games"
                        ? ["#3b82f6", "#6d28d9"]
                        : value === "tests"
                          ? ["#eab308", "#f59e0b"]
                          : ["#14b8a6", "#059669"]
                    }
                    style={styles.categoryIcon}
                  >
                    <IconComponent
                      iconType={categoryIcons[value].type}
                      name={categoryIcons[value].name}
                      size={32}
                      color="white"
                    />
                  </LinearGradient>
                  <Text style={styles.categoryLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Activity Cards */}
          {selectedCategory && (
            <View style={styles.activitiesGrid}>
              {filteredActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => handleStartPractice(activity)}
                >
                  <View style={styles.activityHeader}>
                    <LinearGradient colors={activity.colors} style={styles.activityIcon}>
                      <IconComponent iconType={activity.iconType} name={activity.icon} size={20} color="white" />
                    </LinearGradient>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityDescription}>{activity.description}</Text>
                  </View>
                  <LinearGradient colors={activity.colors} style={styles.startButton}>
                    <Text style={styles.startButtonText}>Başla</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Word Set Modal */}
        <Modal
          visible={showWordSetModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWordSetModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  {selectedActivity && (
                    <LinearGradient colors={selectedActivity.colors} style={styles.modalIcon}>
                      <IconComponent
                        iconType={selectedActivity.iconType}
                        name={selectedActivity.icon}
                        size={16}
                        color="white"
                      />
                    </LinearGradient>
                  )}
                  <Text style={styles.modalTitle}>{selectedActivity?.title}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowWordSetModal(false)} style={styles.closeButton}>
                  <Ionicons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>Hangi kelime grubuyla pratik yapmak istiyorsun?</Text>

              <View style={styles.wordSetOptions}>
                {Object.entries(wordSetLabels).map(([value, label]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setSelectedWordSet(value)}
                    style={[styles.wordSetOption, selectedWordSet === value && styles.selectedWordSetOption]}
                  >
                    {selectedWordSet === value && selectedActivity ? (
                      <LinearGradient colors={selectedActivity.colors as any} style={styles.selectedOption}>
                        <Text style={styles.selectedOptionText}>{label}</Text>
                        {value === "learned" && <Text style={styles.selectedOptionSubtext}>156 kelime</Text>}
                        {value === "favorites" && <Text style={styles.selectedOptionSubtext}>23 kelime</Text>}
                        {value === "unlearned" && <Text style={styles.selectedOptionSubtext}>89 kelime</Text>}
                      </LinearGradient>
                    ) : (
                      <View style={styles.unselectedOption}>
                        <Text style={styles.unselectedOptionText}>{label}</Text>
                        {value === "learned" && <Text style={styles.unselectedOptionSubtext}>156 kelime</Text>}
                        {value === "favorites" && <Text style={styles.unselectedOptionSubtext}>23 kelime</Text>}
                        {value === "unlearned" && <Text style={styles.unselectedOptionSubtext}>89 kelime</Text>}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={startPracticeWithWordSet} style={styles.startPracticeButton}>
                {selectedActivity && (
                  <LinearGradient colors={selectedActivity.colors as any} style={styles.startPracticeGradient}>
                    <Text style={styles.startPracticeText}>Pratiğe Başla</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </LinearGradient>
                )}
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
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 4,
  },
  profileContainer: {
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  streakText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 6,
  },
  titleSection: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 32,
  },
  backButton: {
    padding: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    alignSelf: "center",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  statCard: {
    width: (width - 140) / 2,
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  categoriesGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 32,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  activitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 32,
  },
  activityCard: {
    width: (width - 52) / 2,
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  activityHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  activityIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  activityDescription: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  startButton: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    padding: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  wordSetOptions: {
    gap: 12,
    marginBottom: 28,
  },
  wordSetOption: {
    borderRadius: 16,
    overflow: "hidden",
  },
  selectedWordSetOption: {},
  selectedOption: {
    padding: 20,
  },
  selectedOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  selectedOptionSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
  unselectedOption: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  unselectedOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  unselectedOptionSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  startPracticeButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  startPracticeGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 12,
  },
  startPracticeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PracticeScreen;
