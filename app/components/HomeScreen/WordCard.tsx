import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent, HandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import OutlinedText from '../shared/OutlinedText';
import { FontAwesome } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

interface Word {
  word_id: number;
  word_text: string;
  word_meaning: string;
  word_type?: string;
  example_sentence?: string;
  pronunciation?: string;
}

interface WordMeta {
  difficulty?: string;
  [key: string]: any;
}

interface WordCardProps {
  word: Word;
  meta?: WordMeta;
  translateY: Animated.Value;
  opacity: Animated.Value;
  onGestureEvent: (event: PanGestureHandlerGestureEvent) => void;
  onHandlerStateChange: (event: HandlerStateChangeEvent) => void;
  isAnimating: boolean;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({ 
  word, 
  meta, 
  translateY, 
  opacity, 
  onGestureEvent, 
  onHandlerStateChange, 
  isAnimating,
  onFavoritePress,
  isFavorite = false
}) => {
  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      enabled={!isAnimating}
    >
      <Animated.View
        style={[
          styles.card,
          { transform: [{ translateY }], opacity }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{meta.difficulty}</Text>
          </View>
        </View>
        <View style={styles.wordContainer}>
          <OutlinedText style={styles.word}>{word.word_text}</OutlinedText>
        </View>
        <Text style={styles.meaning}>{word.word_meaning}</Text>
        <View style={styles.exampleContainer}>
          <Text style={styles.example}>{word.example_sentence}</Text>
        </View>
        {/* Alt ikon barı */}
        <View style={styles.iconBar}>
          <TouchableOpacity onPress={() => { /* bilgi */ }}>
            <FontAwesome name="info-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { /* paylaş */ }}>
            <FontAwesome name="share" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {
            console.log('KALP BASILDI!');
            onFavoritePress && onFavoritePress();
          }}>
            <FontAwesome name={isFavorite ? "heart" : "heart-o"} size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { /* yer imi */ }}>
            <FontAwesome name="bookmark-o" size={36} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.92,
    height: height * 0.7,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 32,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  wordContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 48,
  },
  word: { 
    color: "white", 
    fontSize: 48, 
    fontWeight: "bold",
    textAlign: 'center',
  },
  meaning: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 32,
    textAlign: 'center',
  },
  exampleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  example: {
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 'auto',
  },
});

export default WordCard;
