import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import PracticeContent from '../components/PracticeScreen/PracticeContent';

export default function PracticeScreen({ navigation }) {
  const { themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <PracticeContent />
      </Background>
    </View>
  );
}

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: 'transparent',
  },
}); 