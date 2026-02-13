import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyState}>
      <FontAwesome name="search" size={48} color="rgba(255,255,255,0.6)" />
      <Text style={styles.emptyText}>Bu kategoride kelime seti bulunamadı</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default EmptyState;
