import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function FlashcardHeader({
  title,
  currentIndex,
  totalWords,
  onBackPress,
  onRestartPress,
  styles
}) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onBackPress}>
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>
          {currentIndex + 1} / {totalWords}
        </Text>
      </View>
      <TouchableOpacity style={styles.headerButton} onPress={onRestartPress}>
        <Icon name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
