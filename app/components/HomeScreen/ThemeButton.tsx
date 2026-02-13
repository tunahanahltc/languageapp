import React from 'react';
import { TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';

interface ThemeButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        { 
          backgroundColor: 'rgba(255,255,255,0.2)', 
          borderRadius: 20, 
          padding: 12,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        },
        style
      ]}
    >
      <Text style={{ fontSize: 24 }}>🎨</Text>
    </TouchableOpacity>
  );
};

export default ThemeButton;
