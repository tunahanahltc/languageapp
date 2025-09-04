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
import { useAuth } from "../contexts/AuthContext";
import Background from "../components/shared/Background";
import HybridDatabaseService from "../services/HybridDatabaseService";
import LocalDatabaseService from "../services/LocalDatabaseService";
import ttsService from "../services/TextToSpeechService";
import FlashcardHeader from "../components/FlashcardScreen/FlashcardHeader";
import ProgressBar from "../components/FlashcardScreen/ProgressBar";
import FlashcardCard from "../components/FlashcardScreen/FlashcardCard";
import ActionButtons from "../components/FlashcardScreen/ActionButtons";
import { flashcardStyles } from "../components/FlashcardScreen/styles";

const { width, height } = Dimensions.get("window");

export default function FlashcardScreen({ route, navigation }) {    
    const { themeColors } = useTheme();
    const { user } = useAuth();
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
  
  // Öğrenilen ve tekrar edilecek kelimeleri takip et
  const [learnedWords, setLearnedWords] = useState([]); // Öğrenilen kelimeler
  const [repeatWords, setRepeatWords] = useState([]); // Tekrar edilecek kelimeler
  
  // Buton animasyonları
  const [learnedIconRotation] = useState(new Animated.Value(0));
  const [repeatIconRotation] = useState(new Animated.Value(0));
  const [learnedButtonScale] = useState(new Animated.Value(1));
  const [repeatButtonScale] = useState(new Animated.Value(1));
  
  // Buton debounce kontrolü
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

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
        // Kelime istatistiklerini user_words_data'dan yükle
        const initialStats = {};
        const wordSetId = wordSet?.id || categoryId;
        
        if (user?.id && wordSetId) {
          try {
            // Toplu olarak user_words_data'dan veri çek (sadece local'den)
            console.log('📊 Toplu user_words_data yükleniyor...');
            let allUserWordData = await HybridDatabaseService.getAllUserWordData(user.id, wordSetId);
            console.log(`📊 ${allUserWordData.length} user_words_data kaydı bulundu`);
            
            // Eğer hiç user_words_data yoksa, ilk kez açılıyor demektir - tabloyu başlat
            if (allUserWordData.length === 0) {
              console.log('🔄 İlk kez açılıyor, user_words_data tablosu başlatılıyor...');
              await HybridDatabaseService.initializeSetWordsForUser(user.id, wordSetId);
              allUserWordData = await HybridDatabaseService.getAllUserWordData(user.id, wordSetId);
              console.log(`📊 Başlatma sonrası ${allUserWordData.length} user_words_data kaydı bulundu`);
            }
            
            // Verileri word_id'ye göre map'le
            const userWordDataMap = {};
            allUserWordData.forEach(data => {
              userWordDataMap[data.word_id] = data;
            });
            
            // Sadece öğrenilmeyen kelimeleri filtrele
            const unlearnedWords = wordsData.filter(word => {
              const userWordData = userWordDataMap[word.word_id];
              // Eğer user_word_data varsa ve is_learned false ise kelimeyi dahil et
              return !userWordData || userWordData.is_learned !== 1;
            });
            
            console.log(`📚 Toplam ${wordsData.length} kelime, ${unlearnedWords.length} öğrenilmemiş kelime`);
            
            // Sadece öğrenilmeyen kelimeleri set et
            setWords(unlearnedWords);
            
            // Her kelime için veriyi ata
            unlearnedWords.forEach(word => {
              const userWordData = userWordDataMap[word.word_id];
              if (userWordData) {
                initialStats[word.word_id] = {
                  learned: userWordData.is_learned === 1,
                  attempt_count: userWordData.attempt_count || 0,
                  correct_count: userWordData.correct_count || 0,
                  difficulty_rating: userWordData.difficulty_rating || 0
                };
              } else {
                initialStats[word.word_id] = {
                  learned: false,
                  attempt_count: 0,
                  correct_count: 0,
                  difficulty_rating: 0
                };
              }
            });
            console.log(`📊 ${unlearnedWords.length} kelime için user_words_data yüklendi`);
          } catch (error) {
            console.error('❌ user_words_data yükleme hatası:', error);
            // Hata durumunda tüm kelimeleri göster
            setWords(wordsData);
            wordsData.forEach(word => {
              initialStats[word.word_id] = {
                learned: false,
                attempt_count: 0,
                correct_count: 0,
                difficulty_rating: 0
              };
            });
          }
        } else {
          // Kullanıcı yoksa tüm kelimeleri göster
          setWords(wordsData);
          wordsData.forEach(word => {
            initialStats[word.word_id] = {
              learned: false,
              attempt_count: 0,
              correct_count: 0,
              difficulty_rating: 0
            };
          });
        }
        
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
    const totalChanges = learnedWords.length + repeatWords.length;
    
    Alert.alert(
      "🎉 Tebrikler!",
      `${title}deki tüm kelimeleri gözden geçirdiniz!\n${learnedWords.length} kelime öğrenildi, ${repeatWords.length} kelime tekrar edilecek.`,
      [
        { 
          text: "💾 Kaydet & Tekrar Et", 
          onPress: async () => {
            await saveProgressToSupabase();
            restartFlashcards();
          }
        },
        { 
          text: "💾 Kaydet & Ana Sayfa", 
          onPress: async () => {
            await saveProgressToSupabase();
            navigation.navigate("Home");
          }
        },
        { 
          text: "💾 Kaydet & Geri Dön", 
          onPress: async () => {
            await saveProgressToSupabase();
            navigation.goBack();
          }
        }
      ]
    );
  };

  const restartFlashcards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    flipAnimation.setValue(0);
    slideAnimation.setValue(0);
  };

  // Hem local hem Supabase'e toplu güncelleme yap
  const saveProgressToSupabase = async () => {
    try {
      const wordSetId = wordSet?.id || categoryId;
      
      if (user?.id && wordSetId) {
        console.log('💾 Local ve Supabase\'e toplu güncelleme yapılıyor...');
        
        // Tüm güncellemeleri tek array'de topla
        const allUpdates = [];
        
        // Öğrenilen kelimeleri ekle
        learnedWords.forEach(word => {
          const wordData = {
            is_learned: true,
            attempt_count: (wordStats[word.word_id]?.attempt_count || 0) + 1,
            correct_count: (wordStats[word.word_id]?.correct_count || 0) + 1,
            learned_at: new Date().toISOString(),
            last_attempt: new Date().toISOString()
          };
          
          allUpdates.push({
            userId: user.id,
            setId: parseInt(wordSetId), // Integer olarak gönder
            wordId: word.word_id,
            wordData: wordData
          });
        });
        
        // Tekrar edilecek kelimeleri ekle
        repeatWords.forEach(word => {
          const wordData = {
            is_learned: false,
            attempt_count: (wordStats[word.word_id]?.attempt_count || 0) + 1,
            correct_count: wordStats[word.word_id]?.correct_count || 0,
            learned_at: null,
            last_attempt: new Date().toISOString()
          };
          
          allUpdates.push({
            userId: user.id,
            setId: parseInt(wordSetId), // Integer olarak gönder
            wordId: word.word_id,
            wordData: wordData
          });
        });
        
        // Tek seferde toplu güncelleme yap
        if (allUpdates.length > 0) {
          await HybridDatabaseService.batchUpdateUserWordData(allUpdates);
          console.log(`✅ ${learnedWords.length} öğrenilen, ${repeatWords.length} tekrar edilecek kelime tek seferde güncellendi`);
        } else {
          console.log('📝 Güncellenecek kelime yok');
        }
        
        // user_sets_data tablosunu güncelle
        await updateUserSetProgress();
      }
    } catch (error) {
      console.error('❌ Toplu güncelleme hatası:', error);
    }
  };

  // user_sets_data tablosunu güncelle
  const updateUserSetProgress = async () => {
    try {
      const wordSetId = wordSet?.id || categoryId;
      
      if (user?.id && wordSetId) {
        console.log('📊 user_sets_data tablosu güncelleniyor...');
        
        // Önce toplam kelime sayısını al (setteki tüm kelimeler)
        let totalWords = 0;
        try {
          if (categoryId) {
            const allWords = await HybridDatabaseService.getWordsByCategoryId(categoryId);
            totalWords = allWords?.length || 0;
          } else if (wordSet?.id) {
            const allWords = await HybridDatabaseService.getWordsBySetId(wordSet.id);
            totalWords = allWords?.length || 0;
          }
        } catch (error) {
          console.error('❌ Toplam kelime sayısı alınamadı:', error);
          // Hata durumunda mevcut words array'ini kullan
          totalWords = words.length;
        }
        
        // user_words_data tablosundan o sete ait tüm kelimelerin durumunu al
        let totalLearnedCount = 0;
        try {
          const allUserWordData = await HybridDatabaseService.getAllUserWordData(user.id, wordSetId);
          // Öğrenilmiş kelimeleri say (is_learned === 1 olanlar)
          totalLearnedCount = allUserWordData.filter(data => data.is_learned === 1).length;
          console.log(`📊 user_words_data'dan alınan veri: ${allUserWordData.length} kelime, ${totalLearnedCount} öğrenilmiş`);
        } catch (error) {
          console.error('❌ user_words_data verisi alınamadı:', error);
          // Hata durumunda sadece bu oturumdaki öğrenilen kelimeleri say
          totalLearnedCount = learnedWords.length;
        }
        
        // Kalan kelime sayısını hesapla
        const remainingCount = totalWords - totalLearnedCount;
        
        // Ortalama skor hesapla (basit hesaplama)
        const averageScore = totalWords > 0 ? (totalLearnedCount / totalWords) * 100 : 0;
        
        // Tamamlanma durumunu kontrol et
        const isCompleted = totalLearnedCount === totalWords;
        const completedAt = isCompleted ? new Date().toISOString() : null;
        
        const progressData = {
          learned_count: totalLearnedCount,
          total_words: totalWords,
          average_score: averageScore,
          completed_at: completedAt
        };
        
        console.log('📊 Progress verisi:', progressData);
        console.log(`📚 Toplam: ${totalWords}, Öğrenilmiş: ${totalLearnedCount}, Kalan: ${totalWords - totalLearnedCount}`);
        
        // set_id'yi integer olarak gönder (Supabase'deki tablo yapısına uygun)
        const setIdForSupabase = parseInt(wordSetId);
        console.log(`🔢 set_id integer'a çevrildi: ${wordSetId} -> ${setIdForSupabase}`);
        
        // Hibrit servis ile güncelle
        await HybridDatabaseService.updateUserProgress(user.id, setIdForSupabase, progressData);
        
        console.log(`✅ user_sets_data güncellendi: ${totalLearnedCount}/${totalWords} kelime öğrenildi`);
      }
    } catch (error) {
      console.error('❌ user_sets_data güncelleme hatası:', error);
    }
  };

  // Geri butonuna basıldığında uyarı göster
  const handleBackPress = () => {
    const totalChanges = learnedWords.length + repeatWords.length;
    
    if (totalChanges === 0) {
      // Hiç değişiklik yoksa direkt çık
      navigation.goBack();
      return;
    }
    
    Alert.alert(
      "📚 Çalışmayı Bitir?",
      `${currentIndex + 1}/${words.length} kelime tamamlandı.\n${learnedWords.length} kelime öğrenildi, ${repeatWords.length} kelime tekrar edilecek.\nİlerlemenizi kaydetmek ister misiniz?`,
      [
        {
          text: "❌ Kaydetme",
          onPress: () => {
            navigation.goBack();
          },
          style: "cancel"
        },
        {
          text: "💾 Kaydet & Çık",
          onPress: async () => {
            await saveProgressToSupabase();
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
  const markAsLearned = async () => {
    // Eğer buton zaten devre dışıysa, işlemi engelle
    if (isButtonDisabled) return;
    
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    
    // Butonu devre dışı bırak
    setIsButtonDisabled(true);
    
    // Animasyonu başlat
    animateButton(learnedIconRotation, learnedButtonScale);
    
    setWordStats(prev => ({
      ...prev,
      [currentWord.word_id]: {
        ...prev[currentWord.word_id],
        learned: true
      }
    }));
    
    // Öğrenilen kelimeler listesine ekle
    setLearnedWords(prev => {
      const exists = prev.find(word => word.word_id === currentWord.word_id);
      if (!exists) {
        return [...prev, currentWord];
      }
      return prev;
    });
    
    // Tekrar edilecek kelimeler listesinden çıkar (eğer varsa)
    setRepeatWords(prev => prev.filter(word => word.word_id !== currentWord.word_id));
    
    // Local güncelleme yapma, sadece listelere ekle/çıkar
    console.log(`✅ ${currentWord.word_text} öğrenildi olarak işaretlendi (çıkışta kaydedilecek)`);
    
    console.log(`✅ ${currentWord.word_text} öğrenildi olarak işaretlendi`);
    
    // Otomatik olarak sonraki kelimeye geç
    setTimeout(() => {
      nextWord();
      // Animasyon tamamlandıktan sonra butonu tekrar aktif et
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 300);
    }, 700); // Animasyon için biraz daha uzun
  };

  // Tekrar Et butonuna basıldığında
  const markForRepeat = async () => {
    // Eğer buton zaten devre dışıysa, işlemi engelle
    if (isButtonDisabled) return;
    
    const currentWord = words[currentIndex];
    if (!currentWord) return;
    
    // Butonu devre dışı bırak
    setIsButtonDisabled(true);
    
    // Animasyonu başlat
    animateButton(repeatIconRotation, repeatButtonScale);
    
    setWordStats(prev => ({
      ...prev,
      [currentWord.word_id]: {
        ...prev[currentWord.word_id],
        learned: false
      }
    }));
    
    // Tekrar edilecek kelimeler listesine ekle
    setRepeatWords(prev => {
      const exists = prev.find(word => word.word_id === currentWord.word_id);
      if (!exists) {
        return [...prev, currentWord];
      }
      return prev;
    });
    
    // Öğrenilen kelimeler listesinden çıkar (eğer varsa)
    setLearnedWords(prev => prev.filter(word => word.word_id !== currentWord.word_id));
    
    // Local güncelleme yapma, sadece listelere ekle/çıkar
    console.log(`🔄 ${currentWord.word_text} tekrar edilecek olarak işaretlendi (çıkışta kaydedilecek)`);
    
    console.log(`🔄 ${currentWord.word_text} tekrar edilecek`);
    
    // Otomatik olarak sonraki kelimeye geç
    setTimeout(() => {
      nextWord();
      // Animasyon tamamlandıktan sonra butonu tekrar aktif et
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 300);
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
          disabled={isButtonDisabled}
        />
      </View>
    </Background>
  );
}