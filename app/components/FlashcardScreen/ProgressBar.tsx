import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';

interface ProgressBarProps {
  progress: number;
  styles: {
    progressContainer: StyleProp<ViewStyle>;
    progressBar: StyleProp<ViewStyle>;
    progressFill: StyleProp<ViewStyle>;
    progressText: StyleProp<TextStyle>;
  };
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  styles 
}) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
};

export default ProgressBar;
