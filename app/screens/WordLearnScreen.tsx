import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import Background from "../components/shared/Background";
// @ts-ignore
import Icon from 'react-native-vector-icons/Ionicons';
import HybridDatabaseService from '../services/HybridDatabaseService';
import LocalDatabaseService from '../services/LocalDatabaseService';
import { useFocusEffect } from '@react-navigation/native';
import { WordLearnScreenParams } from '../types';
import SuccessModal from "../components/shared/SuccessModal";

interface Props {
  navigation: any;
  route: any;
}

interface NormalizedSet {
  id: number | string;
  name: string;
  category?: string;
  difficulty?: string;
  progress?: number;
  color?: string;
  total?: number;
}

interface UserSetData {
  user_id: string;
  set_id: number;
  learned_count: number;
  total_words: number;
  average_score: number;
  completed_at: string | null;
  updated_at: string;
}

const WordLearnScreen: React.FC<Props> = ({ navigation, route }) => {
  const { themeColors } = useTheme();
  const { user } = useAuth();
  const { wordSet, category } = route.params || {};

  // Parametreleri normalize et
  const normalizedSet: NormalizedSet | null = wordSet || (category ? {
    id: category.id,
    name: category.name,
    category: category.difficulty || category.category || 'A1',
    difficulty: category.difficulty || 'A1',
    progress: category.progress || 0,
    color: category.color || '#3B82F6',
  } : null);

  const [realWordCount, setRealWordCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isExistUserSetData, setIsExistUserSetData] = useState<boolean>(false);
  const [userSetData, setUserSetData] = useState<UserSetData | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      const checkUserSetData = async () => {
        if (user?.id && normalizedSet?.id) {
          console.log('🔄 WordLearnScreen: Kullanıcı set verisi kontrol ediliyor...');
          const userSetDataControl = await LocalDatabaseService.getIsExistUserSetData(user.id, parseInt(normalizedSet.id.toString()));
          setIsExistUserSetData(userSetDataControl);

          // Eğer veri varsa, kullanıcının ilerleme verilerini al
          if (userSetDataControl) {
            console.log('📊 WordLearnScreen: Kullanıcı ilerleme verisi alınıyor...');
            const setIdForProgress = parseInt(normalizedSet.id.toString());
            const userData = await HybridDatabaseService.getUserProgress(user.id, setIdForProgress);
            setUserSetData(userData);
            console.log('✅ WordLearnScreen: İlerleme verisi güncellendi:', userData);
          } else {
            console.log('📝 WordLearnScreen: Henüz kullanıcı set verisi yok');
          }
        }
      };
      checkUserSetData();
    }, [user?.id, normalizedSet?.id])
  );

  useEffect(() => {
    const fetchWordCount = async () => {
      if (normalizedSet?.id) {
        try {
          const count = await HybridDatabaseService.getWordCountByCategoryId(parseInt(normalizedSet.id.toString()));
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

  const handlePrimaryButtonPress = async (): Promise<void> => {
    console.log('🚀 handlePrimaryButtonPress başladı');

    if (!normalizedSet || !user) return;

    if (isExistUserSetData) {
      // Devam Et - FlashcardScreen'e git
      console.log('🎯 Devam Et - FlashcardScreen\'e yönlendiriliyor...');
      navigation.navigate("FlashcardScreen" as never, { categoryId: normalizedSet.id } as never);
    } else {
      // Seti Başlat - Yeni set başlat
      console.log('🆕 Yeni set başlatılıyor...');

      try {
        const newUserSetData: UserSetData = {
          user_id: user.id,
          set_id: parseInt(normalizedSet.id.toString()), // Integer olarak gönder
          learned_count: 0,
          total_words: realWordCount,
          average_score: 0.0,
          completed_at: null,
          updated_at: new Date().toISOString()
        };

        console.log('💾 User set data kaydediliyor...');
        await HybridDatabaseService.saveUserProgress(user.id, parseInt(normalizedSet.id.toString()), newUserSetData);
        console.log('✅ User set data kaydedildi');

        // Set öğrenmeye başlandığında tüm kelimeleri user_words_data'ya ekle
        console.log('📚 Set kelimeleri user_words_data\'ya ekleniyor...');

        try {
          console.log('🔄 initializeSetWordsForUser çağrılıyor...');
          const result = await HybridDatabaseService.initializeSetWordsForUser(user.id, parseInt(normalizedSet.id.toString()));
          console.log('✅ Set kelimeleri user_words_data\'ya eklendi, sonuç:', result);

          if (!result) {
            console.warn('⚠️ Kelime initialize edildi ama sonuç false döndü (kelime olmayabilir)');
          }
        } catch (wordError: any) {
          console.error('❌ Set kelimeleri ekleme hatası:', wordError);
          // Kritik değilse devam et, ama logla
        }

        // State'i güncelle
        setIsExistUserSetData(true);
        setUserSetData(newUserSetData);

        console.log('✅ Yeni kullanıcı set verisi oluşturuldu');

        // Modal'ı göster
        setIsSuccessModalVisible(true);
      } catch (error: any) {
        console.error('❌ Kullanıcı set verisi oluşturma hatası:', error);
        Alert.alert('Hata', '❌ Bir sorun oluştu: ' + error.message);
      }
    }
  };

  const handleRefresh = async (): Promise<void> => {
    if (user?.id && normalizedSet?.id) {
      console.log('🔄 Manuel refresh başlatılıyor...');
      const setIdForProgress = parseInt(normalizedSet.id.toString());
      try {
        const userData = await HybridDatabaseService.getUserProgress(user.id, setIdForProgress);
        setUserSetData(userData);
        console.log('✅ Manuel refresh tamamlandı:', userData);
      } catch (error) {
        console.error('❌ Manuel refresh hatası:', error);
      }
    }
  };

  const getDifficultyText = (difficulty?: string): string => {
    switch (difficulty) {
      case "A1": return "Kolay";
      case "B1": return "Orta";
      case "C1": return "Zor";
      default: return "Kolay";
    }
  };

  const getProgressPercent = (): number => {
    if (!userSetData || realWordCount === 0) return 0;
    return Math.round((userSetData.learned_count / realWordCount) * 100);
  };

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.placeholder} />
          <TouchableOpacity onPress={handleRefresh} style={styles.backButton}>
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
                      {loading ? "..." : (userSetData?.learned_count || 0)}
                    </Text>
                    <Text style={styles.statLabel}>Öğrenilen</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {loading ? "..." : (realWordCount - (userSetData?.learned_count || 0))}
                    </Text>
                    <Text style={styles.statLabel}>Kalan</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>İlerleme Durumu</Text>
                  <Text style={styles.progressPercent}>
                    %{getProgressPercent()}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, {
                      width: `${getProgressPercent()}%`,
                      backgroundColor: normalizedSet.color || '#3B82F6'
                    }]}
                  />
                </View>
              </View>

              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyLabel}>Zorluk Seviyesi</Text>
                <View style={[styles.difficultyBadge, { backgroundColor: normalizedSet.color || '#3B82F6' }]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(normalizedSet.difficulty)}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: normalizedSet.color || '#3B82F6' }]}
                  onPress={handlePrimaryButtonPress}
                >
                  <Text style={styles.primaryButtonText}>
                    {isExistUserSetData ? 'Devam Et' : 'Seti Başlat'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => { }}>
                  <Text style={styles.secondaryButtonText}>Öğrenilen Kelimeler</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <SuccessModal
          isVisible={isSuccessModalVisible}
          onClose={() => setIsSuccessModalVisible(false)}
          title="Maceran Başlıyor! 🚀"
          message={`${normalizedSet.name} setine başarıyla kayıt oldun. Tüm kelimeler senin için hazırlandı. Şimdi öğrenme zamanı!`}
          buttonText="Hadi Başlayalım"
          color={normalizedSet.color || '#10B981'}
        />
      </Background>
    </View>
  );
};

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

export default WordLearnScreen;
