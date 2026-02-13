import React from 'react';
import { View, Text, ScrollView, Modal, Pressable, TouchableOpacity, Dimensions } from 'react-native';
import { PALETTES, PALETTE_NAMES } from '../../constants/themes';

const { height } = Dimensions.get('window');

interface ThemeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ 
  visible, 
  onClose, 
  currentTheme, 
  onThemeChange 
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={onClose}>
        <View style={{ 
          position: 'absolute', 
          top: 80, 
          right: 20, 
          left: 20,
          backgroundColor: 'rgba(255,255,255,0.95)', 
          borderRadius: 20, 
          padding: 20, 
          elevation: 10, 
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          maxHeight: height * 0.7,
        }}>
          <Text style={{ 
            fontWeight: 'bold', 
            fontSize: 18, 
            marginBottom: 16, 
            color: '#333',
            textAlign: 'center'
          }}>
            Tema Seç (50 Tema)
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {PALETTE_NAMES.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => onThemeChange(name)}
                style={{
                  backgroundColor: currentTheme === name ? 'rgba(0,0,0,0.1)' : 'transparent',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginBottom: 8,
                  borderWidth: currentTheme === name ? 2 : 0,
                  borderColor: '#007AFF',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                {/* Renk simgesi */}
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  marginRight: 12,
                  backgroundColor: PALETTES[name][0],
                  borderWidth: 1,
                  borderColor: '#ddd',
                }} />
                <Text style={{ 
                  color: '#333', 
                  fontWeight: currentTheme === name ? 'bold' : 'normal', 
                  fontSize: 16,
                  flex: 1,
                }}>
                  {name.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

export default ThemeModal;
