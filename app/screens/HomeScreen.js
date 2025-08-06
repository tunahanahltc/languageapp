import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { State } from "react-native-gesture-handler";
import HybridDatabaseService from '../services/HybridDatabaseService';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import WordCard from '../components/HomeScreen/WordCard';
import ThemeButton from '../components/HomeScreen/ThemeButton';
import ThemeModal from '../components/HomeScreen/ThemeModal';

const { height, width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { currentTheme, themeColors, changeTheme } = useTheme();
  const [wordSets, setWordSets] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // Fetch words from Supabase
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setLoading(true);
        const data = await HybridDatabaseService.getAllWords();
        console.log('Fetched words:', data);
        
        if (data && data.length > 0) {
          // Gerçek verileri kullan
          const wordsWithMeta = data.map(word => ({
            word_text: word.word_text,
            word_meaning: word.meaning,
            example_sentence: word.example_sentence,
            setInfo: {
              icon: '📚',
              title: 'Kelime Seti',
              difficulty: 'Kolay',
              gradient: ['#10B981', '#3B82F6'],
            }
          }));
          
          const shuffled = shuffleArray(wordsWithMeta);
          setShuffledWords(shuffled);
        } else {
          // Eğer veri yoksa mock data kullan
          const mockWords = [
            {
              word_text: 'hello',
              word_meaning: 'merhaba',
              example_sentence: 'Hello, how are you?',
              setInfo: {
                icon: '👋',
                title: 'Temel Kelimeler',
                difficulty: 'Kolay',
                gradient: ['#10B981', '#3B82F6'],
              }
            },
            {
              word_text: 'world',
              word_meaning: 'dünya',
              example_sentence: 'The world is beautiful.',
              setInfo: {
                icon: '🌍',
                title: 'Temel Kelimeler',
                difficulty: 'Kolay',
                gradient: ['#10B981', '#3B82F6'],
              }
            },
            {
              word_text: 'learn',
              word_meaning: 'öğrenmek',
              example_sentence: 'I want to learn English.',
              setInfo: {
                icon: '📚',
                title: 'Temel Kelimeler',
                difficulty: 'Kolay',
                gradient: ['#10B981', '#3B82F6'],
              }
            }
          ];
          
          const shuffled = shuffleArray(mockWords);
          setShuffledWords(shuffled);
        }
      } catch (error) {
        console.error('Error fetching words:', error);
        // Hata durumunda mock data kullan
        const mockWords = [
          {
            word_text: 'hello',
            word_meaning: 'merhaba',
            example_sentence: 'Hello, how are you?',
            setInfo: {
              icon: '👋',
              title: 'Temel Kelimeler',
              difficulty: 'Kolay',
              gradient: ['#10B981', '#3B82F6'],
            }
          }
        ];
        setShuffledWords(mockWords);
      } finally {
        setLoading(false);
      }
    };

    fetchWords();
  }, []);

  // 1. Kelimeleri karıştır
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const displayedWord = shuffledWords[currentIndex];

  // 2. Kart meta bilgisi
  function getWordMeta(word) {
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

  const onHandlerStateChange = (event) => {
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
    SystemUI.setBackgroundColorAsync(themeColors.background);
  }, [themeColors.background]);

  const handleThemeChange = (newTheme) => {
    changeTheme(newTheme);
    setThemeModalVisible(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Background colors={themeColors}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: themeColors.text }]}>
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
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Background colors={themeColors}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: themeColors.text }]}>
                Henüz kelime seti bulunmuyor.
              </Text>
            </View>
          </SafeAreaView>
        </Background>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Background colors={themeColors}>
        <SafeAreaView style={styles.safeArea}>
          {/* Sağ üst köşede tema butonu */}
          <View style={styles.themeButtonContainer}>
            <ThemeButton onPress={() => setThemeModalVisible(true)} />
          </View>

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
            />
          </View>

          {/* Tema Modal */}
          <ThemeModal 
            visible={themeModalVisible}
            onClose={() => setThemeModalVisible(false)}
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
          />
        </SafeAreaView>
      </Background>
    </View>
  );
}

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
  themeButtonContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    padding: 16,
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
