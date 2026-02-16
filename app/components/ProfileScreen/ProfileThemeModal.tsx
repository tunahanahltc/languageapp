import React from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, Dimensions, StyleSheet, Pressable } from 'react-native';
import { PALETTES, PALETTE_NAMES } from '../../constants/themes';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

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

  const formattedName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Temanızı Seçin</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.grid}>
              {PALETTE_NAMES.map((name) => {
                const colors = PALETTES[name];
                const isSelected = currentTheme === name;

                return (
                  <TouchableOpacity
                    key={name}
                    style={[
                      styles.card,
                      isSelected && styles.selectedCard
                    ]}
                    onPress={() => {
                      onThemeChange(name);
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[colors[0], colors[1]]}
                      style={styles.previewGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      {isSelected && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={16} color={colors[0]} />
                        </View>
                      )}
                    </LinearGradient>

                    <Text style={[
                      styles.themeName,
                      isSelected && { color: colors[2] || '#1F2937', fontWeight: 'bold' }
                    ]}>
                      {formattedName(name)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '100%',
    maxHeight: height * 0.7,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '30%', // 3 column grid
    marginBottom: 16,
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    // Minimal border for structure
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCard: {
    borderColor: 'transparent', // Gradient/shadow will define it
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.05 }],
  },
  previewGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeName: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProfileThemeModal;
