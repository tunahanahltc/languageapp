import React from 'react';
import { View, Text } from 'react-native';

export default function ProgressBar({ 
  progress, 
  styles 
}) {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>
    </View>
  );
}
