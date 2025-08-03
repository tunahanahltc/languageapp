import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SystemUI from 'expo-system-ui';
import { State } from "react-native-gesture-handler";
import wordSets from '../data/kelimeSetleri';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import WordCard from '../components/HomeScreen/WordCard';
import ThemeButton from '../components/HomeScreen/ThemeButton';
import ThemeModal from '../components/HomeScreen/ThemeModal';

const { height, width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { currentTheme, themeColors, changeTheme } = useTheme();

  // 1. Kelimeleri karıştır
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const allWords = wordSets.flatMap(set => set.kelimeler);
  const [shuffledWords] = useState(() => shuffleArray(allWords));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const displayedWord = shuffledWords[currentIndex];

  // 2. Kart meta bilgisi
  function getWordMeta(word) {
    for (const set of wordSets) {
      if (set.kelimeler.some(k => k.kelime === word.kelime)) {
        return {
          icon: set.icon,
          title: set.baslik,
          difficulty: set.zorluk,
          gradient: set.gradient,
        };
      }
    }
    return {};
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

  // Navigation bar rengi güncelleme
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(themeColors[1]);
  }, [themeColors]);

  // Menü açma/kapama için state
  const [menuVisible, setMenuVisible] = useState(false);

  // 5. UI
  return (
    <View style={{ flex: 1 }}>
      <Background colors={themeColors}>
        <SafeAreaView style={styles.safeArea}>
          {/* Sağ üst köşede tema butonu */}
          <View style={{ position: 'absolute', top: 0, right: 0, zIndex: 10, padding: 16 }}>
            <ThemeButton onPress={() => setMenuVisible(true)} />
          </View>
          {/* Tema Modal */}
          <ThemeModal
            visible={menuVisible}
            onClose={() => setMenuVisible(false)}
            currentTheme={currentTheme}
            onThemeChange={(theme) => {
              changeTheme(theme);
              setMenuVisible(false);
            }}
          />
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
        </SafeAreaView>
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
