import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Background from "../components/shared/Background";
import Icon from 'react-native-vector-icons/Ionicons';
import HybridDatabaseService from '../services/HybridDatabaseService';

export default function WordLearnScreen({ navigation, route }) {
  const { themeColors } = useTheme();
  const { wordSet, category } = route.params || {};

  // Parametreleri normalize et
  const normalizedSet = wordSet || (category ? {
    id: category.id,
    name: category.name,
    category: category.difficulty || category.category || 'A1',
    difficulty: category.difficulty || 'A1',
    progress: category.progress || 0,
    color: category.color || '#3B82F6',
  } : null);

  const [realWordCount, setRealWordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWordCount = async () => {
      if (normalizedSet?.id) {
        try {
          const count = await HybridDatabaseService.getWordCountByCategoryId(normalizedSet.id);
          setRealWordCount(count);
        } catch (error) {
          setRealWordCount(normalizedSet?.total || 0);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchWordCount();
  }, [normalizedSet?.id]);

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {normalizedSet ? normalizedSet.name : "Kelime Seti"}
          </Text>
          <View style={styles.placeholder} />
          <TouchableOpacity onPress={() => null} style={styles.backButton}>
            <Icon name="refresh" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {normalizedSet && (
            <>
              <View style={styles.infoCard}>
                <Text style={styles.setTitle}>{normalizedSet.name}</Text>
                <Text style={styles.categoryText}>
                  {(normalizedSet.category || normalizedSet.difficulty || 'A1').toUpperCase()}
                </Text>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {loading ? "..." : realWordCount}
                    </Text>
                    <Text style={styles.statLabel}>Toplam Kelime</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {loading ? "..." : Math.round(((normalizedSet.progress || 0) / 100) * realWordCount)}
                    </Text>
                    <Text style={styles.statLabel}>Öğrenilen</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {loading ? "..." : (realWordCount - Math.round(((normalizedSet.progress || 0) / 100) * realWordCount))}
                    </Text>
                    <Text style={styles.statLabel}>Kalan</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>İlerleme Durumu</Text>
                  <Text style={styles.progressPercent}>
                    %{normalizedSet.progress || 0}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${normalizedSet.progress || 0}%`, backgroundColor: normalizedSet.color || '#3B82F6' }]}
                  />
                </View>
              </View>

              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyLabel}>Zorluk Seviyesi</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: normalizedSet.color || '#3B82F6' }]}>
                  <Text style={styles.difficultyText}>
                    {(normalizedSet.difficulty || 'A1') === "A1" ? "Kolay" : (normalizedSet.difficulty === "B1" ? "Orta" : (normalizedSet.difficulty === "C1" ? "Zor" : "Kolay"))}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: normalizedSet.color || '#3B82F6' }]}
                  onPress={() => navigation.navigate("FlashcardScreen", { categoryId: normalizedSet.id })}
                >
                  <Text style={styles.primaryButtonText}>Öğrenmeye Başla</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => {}}>
                  <Text style={styles.secondaryButtonText}>Öğrenilen Kelimeler</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  backButtonText: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", textAlign: "center", flex: 1, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  placeholder: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  infoCard: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20, padding: 24, marginBottom: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  setTitle: { fontSize: 24, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 8, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  categoryText: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 20, fontWeight: "600", letterSpacing: 1 },
  statsContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 16 },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#fff", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  statLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4, fontWeight: "500" },
  progressContainer: { marginBottom: 24 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  progressText: { fontSize: 16, color: "#fff", fontWeight: "600", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  progressPercent: { fontSize: 16, color: "#fff", fontWeight: "bold", textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  progressBar: { width: "100%", height: 12, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 6, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 6 },
  difficultyContainer: { alignItems: "center", marginBottom: 32 },
  difficultyLabel: { fontSize: 16, color: "#fff", fontWeight: "600", marginBottom: 8, textShadowColor: "rgba(0,0,0,0.8)", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
  difficultyBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  difficultyText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  buttonContainer: { gap: 16 },
  primaryButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  primaryButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  secondaryButton: { paddingVertical: 16, borderRadius: 16, alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  secondaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
