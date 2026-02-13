import React, { ReactNode } from 'react';
import { View, Text, TextStyle, StyleProp } from 'react-native';

interface OutlinedTextProps {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
}

// Türkçe açıklama: Bu bileşen, yazının dışına siyah bir çizgi efekti verir.
const OutlinedText: React.FC<OutlinedTextProps> = ({ children, style }) => (
  <View style={{ position: 'relative' }}>
    {/* Dış çizgi için siyah ve gölgeli */}
    <Text
      style={[
        {
          color: 'black',
          fontSize: 36,
          fontWeight: 'bold',
          position: 'absolute',
          left: 0,
          top: 0,
          textShadowColor: '#000',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
    {/* İç yazı için beyaz */}
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
          fontWeight: 'bold',
        },
        style,
      ]}
    >
      {children}
    </Text>
  </View>
);

export default OutlinedText;
