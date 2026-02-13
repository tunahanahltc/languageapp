import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Word {
  word_id: number;
  word_text: string;
  word_meaning?: string;
}

interface WordStats {
  [key: number]: {
    learned: boolean;
  };
}

interface ActionButtonsProps {
  currentWord: Word | null;
  wordStats: WordStats;
  onLearnedPress: () => void;
  onRepeatPress: () => void;
  learnedButtonAnimatedStyle: any;
  repeatButtonAnimatedStyle: any;
  learnedIconRotateStyle: any;
  repeatIconRotateStyle: any;
  styles: {
    actionButtonContainer: StyleProp<ViewStyle>;
    actionButton: StyleProp<ViewStyle>;
    learnedButton: StyleProp<ViewStyle>;
    learnedButtonActive: StyleProp<ViewStyle>;
    repeatButton: StyleProp<ViewStyle>;
    actionButtonText: StyleProp<TextStyle>;
  };
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  currentWord,
  wordStats,
  onLearnedPress,
  onRepeatPress,
  learnedButtonAnimatedStyle,
  repeatButtonAnimatedStyle,
  learnedIconRotateStyle,
  repeatIconRotateStyle,
  styles,
  disabled = false
}) => {
  return (
    <View style={styles.actionButtonContainer}>
      <Animated.View style={learnedButtonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.learnedButton,
            currentWord && wordStats[currentWord.word_id]?.learned && styles.learnedButtonActive,
            disabled && { opacity: 0.5 }
          ]}
          onPress={onLearnedPress}
          disabled={disabled}
        >
          <Animated.View style={learnedIconRotateStyle}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
          </Animated.View>
          <Text style={styles.actionButtonText}>Öğrendim</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={repeatButtonAnimatedStyle}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.repeatButton,
            disabled && { opacity: 0.5 }
          ]}
          onPress={onRepeatPress}
          disabled={disabled}
        >
          <Animated.View style={repeatIconRotateStyle}>
            <Ionicons name="refresh-circle" size={24} color="#fff" />
          </Animated.View>
          <Text style={styles.actionButtonText}>Tekrar Et</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default ActionButtons;
