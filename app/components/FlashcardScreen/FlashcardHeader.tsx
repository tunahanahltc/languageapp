import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FlashcardHeaderProps {
  title: string;
  currentIndex: number;
  totalWords: number;
  onBackPress: () => void;
  onRestartPress: () => void;
  styles: {
    header: StyleProp<ViewStyle>;
    headerButton: StyleProp<ViewStyle>;
    headerCenter: StyleProp<ViewStyle>;
    headerTitle: StyleProp<TextStyle>;
    headerSubtitle: StyleProp<TextStyle>;
  };
}

const FlashcardHeader: React.FC<FlashcardHeaderProps> = ({
  title,
  currentIndex,
  totalWords,
  onBackPress,
  onRestartPress,
  styles
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>
          {currentIndex + 1} / {totalWords}
        </Text>
      </View>
      <TouchableOpacity style={styles.headerButton} onPress={onRestartPress}>
        <Ionicons name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default FlashcardHeader;
