import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Word {
  word_id: number;
  word_text: string;
  word_type?: string;
  pronunciation?: string;
  meaning: string;
  example_sentence?: string;
  example_sentence_mean?: string;
}

interface FlashcardCardProps {
  currentWord: Word;
  isFlipped: boolean;
  flipAnimation: Animated.Value;
  slideAnimation: Animated.Value;
  frontAnimatedStyle: any;
  backAnimatedStyle: any;
  onCardPress: () => void;
  onVolumePress?: () => void;
  styles: {
    cardContainer: StyleProp<ViewStyle>;
    cardWrapper: StyleProp<ViewStyle>;
    card: StyleProp<ViewStyle>;
    cardSide: StyleProp<ViewStyle>;
    cardFront: StyleProp<ViewStyle>;
    cardBack: StyleProp<ViewStyle>;
    wordText: StyleProp<TextStyle>;
    wordType: StyleProp<TextStyle>;
    pronunciationText: StyleProp<TextStyle>;
    tapHint: StyleProp<ViewStyle>;
    tapHintText: StyleProp<TextStyle>;
    meaningText: StyleProp<TextStyle>;
    exampleContainer: StyleProp<ViewStyle>;
    exampleTitle: StyleProp<TextStyle>;
    exampleText: StyleProp<TextStyle>;
    exampleMeanText: StyleProp<TextStyle>;
    volumeButtonOverlay: StyleProp<ViewStyle>;
    volumeIconContainer: StyleProp<ViewStyle>;
    volumeIcon: StyleProp<ViewStyle>;
  };
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({
  currentWord,
  isFlipped,
  flipAnimation,
  slideAnimation,
  frontAnimatedStyle,
  backAnimatedStyle,
  onCardPress,
  onVolumePress,
  styles,
}) => {
  return (
    <View style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ translateX: slideAnimation }] },
        ]}
      >
        <TouchableWithoutFeedback onPress={onCardPress}>
          <Animated.View style={styles.card}>
            {/* Front Side - İngilizce Kelime */}
            <Animated.View
              style={[styles.cardSide, styles.cardFront, frontAnimatedStyle]}
            >
              <Text style={styles.wordText}>{currentWord.word_text}</Text>
              <Text style={styles.wordType}>
                {currentWord.word_type || "word"}
              </Text>
              <Text style={styles.pronunciationText}>
                {currentWord.pronunciation || ""}
              </Text>
              
              <View style={styles.tapHint}>
                <Ionicons name="hand-left" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.tapHintText}>Anlamı için dokun</Text>
              </View>
            </Animated.View>

            {/* Back Side - Türkçe Anlam */}
            <Animated.View
              style={[styles.cardSide, styles.cardBack, backAnimatedStyle]}
            >
              <Text style={styles.meaningText}>{currentWord.meaning}</Text>
              {currentWord.example_sentence && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Örnek Cümle:</Text>
                  <Text style={styles.exampleText}>
                    {currentWord.example_sentence}
                  </Text>
                  {currentWord.example_sentence_mean && (
                    <Text style={styles.exampleMeanText}>
                      {currentWord.example_sentence_mean}
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.tapHint}>
                <Ionicons name="hand-left" size={20} color="rgba(255,255,255,0.7)" />
                <Text style={styles.tapHintText}>Kelimeye dön</Text>
              </View>
            </Animated.View>
          </Animated.View>
        </TouchableWithoutFeedback>
        
        {/* Volume Button - Flip animasyonu ile senkronize fade */}
        <Animated.View 
          style={[
            styles.volumeButtonOverlay,
            { 
              transform: [{ translateX: slideAnimation }],
              opacity: flipAnimation.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [1, 0, 0, 1],
                extrapolate: 'clamp',
              })
            }
          ]}
        >
          <TouchableOpacity
            style={styles.volumeIconContainer}
            onPress={() => {
              console.log("🔊 Volume pressed - isolated");
              onVolumePress && onVolumePress();
            }}
            activeOpacity={0.5}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={styles.volumeIcon}>
              <Ionicons
                name="volume-high-outline"
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export default FlashcardCard;
