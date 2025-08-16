import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ActionButtons({
  currentWord,
  wordStats,
  onLearnedPress,
  onRepeatPress,
  learnedButtonAnimatedStyle,
  repeatButtonAnimatedStyle,
  learnedIconRotateStyle,
  repeatIconRotateStyle,
  styles
}) {
  return (
    <View style={styles.actionButtonContainer}>
      <Animated.View style={learnedButtonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.learnedButton,
            wordStats[currentWord?.word_id]?.learned && styles.learnedButtonActive
          ]}
          onPress={onLearnedPress}
        >
          <Animated.View style={learnedIconRotateStyle}>
            <Icon name="checkmark-circle" size={24} color="#fff" />
          </Animated.View>
          <Text style={styles.actionButtonText}>Öğrendim</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={repeatButtonAnimatedStyle}>
        <TouchableOpacity
          style={[styles.actionButton, styles.repeatButton]}
          onPress={onRepeatPress}
        >
          <Animated.View style={repeatIconRotateStyle}>
            <Icon name="refresh-circle" size={24} color="#fff" />
          </Animated.View>
          <Text style={styles.actionButtonText}>Tekrar Et</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
