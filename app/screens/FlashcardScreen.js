import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Background from "../components/shared/Background";
import HybridDatabaseService from "../services/HybridDatabaseService";
import ttsService from "../services/TextToSpeechService";
import FlashcardHeader from "../components/FlashcardScreen/FlashcardHeader";
import ProgressBar from "../components/FlashcardScreen/ProgressBar";
import FlashcardCard from "../components/FlashcardScreen/FlashcardCard";
import ActionButtons from "../components/FlashcardScreen/ActionButtons";
import { flashcardStyles } from "../components/FlashcardScreen/styles";

const { width, height } = Dimensions.get("window");

export default function FlashcardScreen({ route, navigation }) {    
    const { themeColors } = useTheme();
  const { wordSet, categoryId } = route.params;
  
  // State yönetimi
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(0));
  
  // Kelime durumu takibi
  const [wordStats, setWordStats] = useState({}); // { wordId: { learned: false } }
  
  // Buton animasyonları
  const [learnedIconRotation] = useState(new Animated.Value(0));
  const [repeatIconRotation] = useState(new Animated.Value(0));
  const [learnedButtonScale] = useState(new Animated.Value(1));
  const [repeatButtonScale] = useState(new Animated.Value(1));

  // Kelime verilerini yükle
  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      setLoading(true);
      
      // Kategori ID varsa kategoriye göre, yoksa set ID'ye göre kelime çek
      let wordsData;
      if (categoryId) {
        console.log(`🔍 Kategori ID ${categoryId} için kelimeler yükleniyor...`);
        wordsData = await HybridDatabaseService.getWordsByCategoryId(categoryId);
      } else if (wordSet?.id) {
        console.log(`🔍 Set ID ${wordSet.id} için kelimeler yükleniyor...`);
        wordsData = await HybridDatabaseService.getWordsBySetId(wordSet.id);
      } else {
        throw new Error("Kategori ID veya Set ID bulunamadı");
      }
      
      if (wordsData && wordsData.length > 0) {
        setWords(wordsData);
        
        // Kelime istatistiklerini başlat
        const initialStats = {};
        wordsData.forEach(word => {
          initialStats[word.word_id] = {
            learned: false
          };
        });
        setWordStats(initialStats);
        
        console.log(`📚 ${wordsData.length} kelime yüklendi`);
      } else {
        Alert.alert("Uyarı", "Bu kategoride henüz kelime bulunmuyor.", [
          { text: "Tamam", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("❌ Kelime yükleme hatası:", error);
      Alert.alert("Hata", "Kelimeler yüklenirken bir hata oluştu.", [
        { text: "Tamam", onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Kartı çevir
  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  // Ses butonuna basıldığında
  const handleVolumePress = async () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;

    try {
      // Yeni speakCurrentSide fonksiyonunu kullan
      const hasExample = currentWord.example_sentence && currentWord.example_sentence.trim() !== '';
      
      await ttsService.speakCurrentSide(currentWord, isFlipped, hasExample);
      
      console.log(`🔊 Speaking ${isFlipped ? 'Turkish meaning' : 'English word'}: "${isFlipped ? currentWord.meaning : currentWord.word_text}"`);
      
    } catch (error) {
      console.error('🔊 TTS Error:', error);
    }
  };

  // Sonraki kelime (otomatik)
  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      slideToNext();
    } else {
      // Son kelime - tamamlandı ekranı
      showCompletionAlert();
    }
  };

  const slideToNext = () => {
    Animated.timing(slideAnimation, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      flipAnimation.setValue(0);
      slideAnimation.setValue(width);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const showCompletionAlert = () => {
    const title = categoryId ? "kategori" : wordSet?.name || "set";
    Alert.alert(
      "🎉 Tebrikler!",
      `${title}deki tüm kelimeleri gözden geçirdiniz!`,
      [
        { text: "Tekrar Et", onPress: () => restartFlashcards() },
        { text: "Ana Sayfaya Dön", onPress: () => navigation.navigate("Home") },
        { text: "Geri Dön", onPress: () => navigation.goBack() }
      ]
    );
  };

  const restartFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    slideAnimation.setValue(0);
  };

  // Geri butonuna basıldığında uyarı göster
  const handleBackPress = () => {
    Alert.alert(
      "📚 Çalışmayı Bitir?",
      `${currentIndex + 1}/${words.length} kelime tamamlandı.\nİlerlemenizi kaydetmek ister misiniz?`,
      [
        {
          text: "❌ Kaydetme",
          onPress: () => {
            // Boş fonksiyon - kaydetmeden geri git
            navigation.goBack();
          },
          style: "cancel"
        },
        {
          text: "💾 Kaydet & Çık",
          onPress: () => {
            // Boş fonksiyon - kaydetmeden geri git (şimdilik)
            navigation.goBack();
          }
        }
      ],
      { cancelable: true }
    );
  };

  // Buton animasyonu - ikon dönme + scale + parlama
  const animateButton = (iconRotation, buttonScale) => {
    // İkon dönme animasyonu
    Animated.timing(iconRotation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      iconRotation.setValue(0); // Reset
    });

    // Buton scale animasyonu
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Öğrendim butonuna basıldığında
  const markAsLearned = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    
    // Animasyonu başlat
    animateButton(learnedIconRotation, learnedButtonScale);
    
    setWordStats(prev => ({
      ...prev,
      [currentWord.word_id]: {
        ...prev[currentWord.word_id],
        learned: true
      }
    }));
    
    console.log(`✅ ${currentWord.word_text} öğrenildi olarak işaretlendi`);
    
    // Otomatik olarak sonraki kelimeye geç
    setTimeout(() => {
      nextWord();
    }, 700); // Animasyon için biraz daha uzun
  };

  // Tekrar Et butonuna basıldığında
  const markForRepeat = () => {
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    
    // Animasyonu başlat
    animateButton(repeatIconRotation, repeatButtonScale);
    
    setWordStats(prev => ({
      ...prev,
      [currentWord.word_id]: {
        ...prev[currentWord.word_id],
        learned: false
      }
    }));
    
    console.log(`🔄 ${currentWord.word_text} tekrar edilecek`);
    
    // Otomatik olarak sonraki kelimeye geç
    setTimeout(() => {
      nextWord();
    }, 700); // Animasyon için biraz daha uzun
  };

  // Animasyon değerleri
  const frontAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      {
        rotateY: flipAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ["180deg", "360deg"],
        }),
      },
    ],
  };

    if (loading) {
    return (
      <Background colors={themeColors}>
        <View style={flashcardStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={flashcardStyles.loadingText}>Kelimeler yükleniyor...</Text>
        </View>
      </Background>
    );
  }

  if (!words.length) {
    return (    
        <Background colors={themeColors}>
        <View style={flashcardStyles.emptyContainer}>
          <Text style={flashcardStyles.emptyText}>
            {categoryId ? "Bu kategoride kelime bulunamadı" : "Bu sette kelime bulunamadı"}
          </Text>
          <TouchableOpacity style={flashcardStyles.backButton} onPress={() => navigation.goBack()}>
            <Text style={flashcardStyles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
            </View>
        </Background>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  // Buton animasyon değerleri
  const learnedIconRotateStyle = {
    transform: [
      {
        rotate: learnedIconRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const repeatIconRotateStyle = {
    transform: [
      {
        rotate: repeatIconRotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  const learnedButtonAnimatedStyle = {
    transform: [{ scale: learnedButtonScale }],
  };

  const repeatButtonAnimatedStyle = {
    transform: [{ scale: repeatButtonScale }],
  };

  return (
    <Background colors={themeColors}>
      <View style={flashcardStyles.container}>
        <FlashcardHeader
          title={categoryId ? "Kategori Flashcard" : wordSet?.name || "Flashcard"}
          currentIndex={currentIndex}
          totalWords={words.length}
          onBackPress={handleBackPress}
          onRestartPress={restartFlashcards}
          styles={flashcardStyles}
        />

        <ProgressBar
          progress={progress}
          styles={flashcardStyles}
        />

        <FlashcardCard
          currentWord={currentWord}
          isFlipped={isFlipped}
          flipAnimation={flipAnimation}
          slideAnimation={slideAnimation}
          frontAnimatedStyle={frontAnimatedStyle}
          backAnimatedStyle={backAnimatedStyle}
          onCardPress={flipCard}
          onVolumePress={handleVolumePress}
          styles={flashcardStyles}
        />

        <ActionButtons
          currentWord={currentWord}
          wordStats={wordStats}
          onLearnedPress={markAsLearned}
          onRepeatPress={markForRepeat}
          learnedButtonAnimatedStyle={learnedButtonAnimatedStyle}
          repeatButtonAnimatedStyle={repeatButtonAnimatedStyle}
          learnedIconRotateStyle={learnedIconRotateStyle}
          repeatIconRotateStyle={repeatIconRotateStyle}
          styles={flashcardStyles}
        />
      </View>
    </Background>
  );
}