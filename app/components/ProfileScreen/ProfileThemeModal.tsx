import React from 'react';
import { View, Text, ScrollView, Modal, Pressable, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { PALETTES, PALETTE_NAMES } from '../../constants/themes';
import { FontAwesome } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface ProfileThemeModalProps {
  visible: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ProfileThemeModal: React.FC<ProfileThemeModalProps> = ({ 
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Tema Seç (50 Tema)</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {PALETTE_NAMES.map((name) => (
              <TouchableOpacity
                key={name}
                onPress={() => {
                  onThemeChange(name);
                  onClose();
                }}
                style={[
                  styles.themeOption,
                  currentTheme === name && styles.selectedThemeOption
                ]}
              >
                <View style={styles.themeOptionContent}>
                  <View style={styles.themeColors}>
                    {PALETTES[name].map((color, index) => (
                      <View 
                        key={index} 
                        style={[styles.themeColorDot, { backgroundColor: color }]} 
                      />
                    ))}
                  </View>
                  <Text style={[
                    styles.themeOptionText,
                    currentTheme === name && styles.selectedThemeOptionText
                  ]}>
                    {name.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                {currentTheme === name && (
                  <FontAwesome name="check" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 80,
    right: 20,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  themeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedThemeOption: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeColors: {
    flexDirection: 'row',
    marginRight: 12,
  },
  themeColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  themeOptionText: {
    color: '#333',
    fontSize: 16,
    flex: 1,
  },
  selectedThemeOptionText: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
});

export default ProfileThemeModal;
