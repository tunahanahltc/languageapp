import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { State, GestureEvent, HandlerStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import HybridDatabaseService from '../services/HybridDatabaseService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColorProperties } from '../constants/themes';
import Background from '../components/shared/Background';
import WordCard from '../components/HomeScreen/WordCard';
import ThemeButton from '../components/HomeScreen/ThemeButton';
import ThemeModal from '../components/HomeScreen/ThemeModal';
import { HomeScreenNavigationProp, ThemeType } from '../types';

const { height, width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

interface WordWithMeta {
  word_id: number;
  word_text: string;
  word_meaning: string;
  meaning: string;
  example_sentence?: string;
  setInfo: {
    icon: string;
    title: string;
    difficulty: string;
    gradient: string[];
  };
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { currentTheme, themeColors, changeTheme } = useTheme();
  const colorProps = getThemeColorProperties(currentTheme);
  const { user } = useAuth();
  const [wordSets, setWordSets] = useState<any[]>([]);
  const [shuffledWords, setShuffledWords] = useState<WordWithMeta[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [themeModalVisible, setThemeModalVisible] = useState<boolean>(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  const handleFavoriteToggle = async (word: WordWithMeta): Promise<void> => {
    if (!user?.id || !word?.word_id) return;
    const wordId = word.word_id;
    const isRemoving = favoriteIds.has(wordId);

    // 1. Optimistic Update (UI'ı hemen boya)
    setFavoriteIds(prev => {
      const ns = new Set(prev);
      if (isRemoving) ns.delete(wordId);
      else ns.add(wordId);
      return ns;
    });

    try {
      // 2. Arka planda DB'ye yaz
      if (isRemoving) {
        await HybridDatabaseService.removeFavoriteWord(user.id, wordId);
      } else {
        await HybridDatabaseService.saveFavoriteWord(user.id, wordId);
      }
    } catch (e: any) {
      console.warn('Favori güncellenemedi, geri alınıyor:', e?.message || e);

      // 3. Hata olursa geri al
      setFavoriteIds(prev => {
        const ns = new Set(prev);
        if (isRemoving) ns.add(wordId);
        else ns.delete(wordId);
        return ns;
      });
    }
  };

  // Fetch random words
  const fetchRandomWords = async (isInitial: boolean = false): Promise<void> => {
    try {
      if (isInitial) setLoading(true);

      const newWords = await HybridDatabaseService.getRandomWords(10);
      console.log(`Fetched ${newWords.length} random words`);

      if (newWords && newWords.length > 0) {
        const wordsWithMeta: WordWithMeta[] = newWords.map(word => ({
          ...word,
          word_id: word.word_id,
          word_text: word.word_text,
          word_meaning: word.meaning,
          meaning: word.meaning,
          example_sentence: word.example_sentence ?? undefined,
          setInfo: {
            icon: '📚',
            title: 'Rastgele Kelime',
            difficulty: 'Karışık',
            gradient: ['#10B981', '#3B82F6'],
          }
        }));

        setShuffledWords(prev => isInitial ? wordsWithMeta : [...prev, ...wordsWithMeta]);
      } else if (isInitial) {
        setShuffledWords([]);
      }
    } catch (error) {
      console.error('Error fetching random words:', error);
      if (isInitial) setShuffledWords([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Initial load & Sync listener
  const { syncCounter } = useAuth(); // AuthContext'ten syncCounter'ı al

  useEffect(() => {
    fetchRandomWords(true);
  }, [syncCounter]); // Sync tamamlanınca (counter değişince) kelimeleri yeniden çek

  // Load more when reaching end
  useEffect(() => {
    if (shuffledWords.length > 0 && currentIndex >= shuffledWords.length - 3) {
      console.log('Loading more random words...');
      fetchRandomWords(false);
    }
  }, [currentIndex, shuffledWords.length]);

  const displayedWord = shuffledWords[currentIndex];

  // 2. Kart meta bilgisi
  function getWordMeta(word?: WordWithMeta) {
    if (!word || !word.setInfo) return {};
    return {
      icon: word.setInfo.icon,
      title: word.setInfo.title,
      difficulty: word.setInfo.difficulty,
      gradient: word.setInfo.gradient,
    };
  }
  const meta = getWordMeta(displayedWord);

  // 3. Animasyonlar
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>): void => {
    if (isAnimating) return;
    if (event.nativeEvent.state === State.END) {
      const threshold = 100;
      if (event.nativeEvent.translationY < -threshold && currentIndex < shuffledWords.length - 1) {
        setIsAnimating(true);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -height,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          setCurrentIndex(idx => idx + 1);
          translateY.setValue(height);
          opacity.setValue(0);
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(() => setIsAnimating(false));
        });
      } else if (event.nativeEvent.translationY > threshold && currentIndex > 0) {
        setIsAnimating(true);
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: height,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          setCurrentIndex(idx => idx - 1);
          translateY.setValue(-height);
          opacity.setValue(0);
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start(() => setIsAnimating(false));
        });
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  // 4. Sistem UI'ı ayarla
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colorProps.background);
  }, [colorProps.background]);

  const handleThemeChange = (newTheme: ThemeType): void => {
    changeTheme(newTheme);
    setThemeModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colorProps.background }]}>
        <Background colors={themeColors}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colorProps.text }]}>
                Kelimeler yükleniyor...
              </Text>
            </View>
          </SafeAreaView>
        </Background>
      </View>
    );
  }

  if (!displayedWord) {
    return (
      <View style={[styles.container, { backgroundColor: colorProps.background }]}>
        <Background colors={themeColors}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colorProps.text }]}>
                Kelime bulunamadı
              </Text>
              <Text style={[{ marginTop: 8, opacity: 0.8, color: colorProps.text }]}>
                Lütfen daha sonra tekrar deneyin.
              </Text>
            </View>
          </SafeAreaView>
        </Background>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colorProps.background }]}>
      <Background colors={themeColors}>
        <SafeAreaView style={styles.safeArea}>

          {/* Ana içerik - kart */}
          <View style={styles.centerContent}>
            <WordCard
              word={displayedWord}
              meta={meta}
              translateY={translateY}
              opacity={opacity}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
              isAnimating={isAnimating}
              onFavoritePress={() => handleFavoriteToggle(displayedWord)}
              isFavorite={!!(displayedWord && favoriteIds.has(displayedWord.word_id))}
            />
          </View>

        </SafeAreaView>
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
