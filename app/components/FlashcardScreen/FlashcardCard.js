import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

export default function FlashcardCard({
  currentWord,
  isFlipped,
  flipAnimation,
  slideAnimation,
  frontAnimatedStyle,
  backAnimatedStyle,
  onCardPress,
  onVolumePress,
  styles,
}) {
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
                <Icon name="hand-left" size={20} color="rgba(255,255,255,0.7)" />
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
                <Icon name="hand-left" size={20} color="rgba(255,255,255,0.7)" />
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
              console.log("🔊 Volume pressed - isolated"); // debug için
              onVolumePress && onVolumePress();
            }}
            activeOpacity={0.5}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={styles.volumeIcon}>
              <Icon
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
}