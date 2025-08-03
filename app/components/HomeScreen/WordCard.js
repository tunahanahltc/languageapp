import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import OutlinedText from '../shared/OutlinedText';
import Icon from 'react-native-vector-icons/FontAwesome';
const { height, width } = Dimensions.get('window');

export default function WordCard({ 
  word, 
  meta, 
  translateY, 
  opacity, 
  onGestureEvent, 
  onHandlerStateChange, 
  isAnimating 
}) {
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
          <OutlinedText style={styles.word}>{word.kelime}</OutlinedText>
        </View>
        <Text style={styles.meaning}>{word.anlam}</Text>
        <View style={styles.exampleContainer}>
          <Text style={styles.example}>{word.ornekCumle}</Text>
        </View>
        {/* Alt ikon barı */}
        <View style={styles.iconBar}>
          <TouchableOpacity onPress={() => { /* bilgi */ }}>
            <Icon name="info-circle" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { /* paylaş */ }}>
            <Icon name="share" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { /* favori */ }}>
            <Icon name="heart-o" size={36} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { /* yer imi */ }}>
            <Icon name="bookmark-o" size={36} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

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
    fontSize: 42, 
    fontWeight: "bold", 
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  meaning: { 
    color: "white", 
    fontSize: 24, 
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.95,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  exampleContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom:32,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  example: { 
    color: "white", 
    fontSize: 16, 
    fontStyle: "italic", 
    opacity: 0.85,
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  iconBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginTop: 32,
    marginBottom: 8,
  },
});
