import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function ThemeButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        borderRadius: 20, 
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
      }}
    >
      <Text style={{ fontSize: 24 }}>🎨</Text>
    </TouchableOpacity>
  );
}
