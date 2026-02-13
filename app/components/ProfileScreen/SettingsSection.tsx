import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface SettingItem {
  icon: string;
  text: string;
  color: string;
}

const settingsItems: SettingItem[] = [
  { icon: 'user', text: 'Profil Bilgileri', color: '#4A90E2' },
  { icon: 'bell', text: 'Bildirimler', color: '#4A90E2' },
  { icon: 'lock', text: 'Gizlilik', color: '#4A90E2' },
  { icon: 'question-circle', text: 'Yardım', color: '#4A90E2' },
];

const SettingsSection: React.FC = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ayarlar</Text>
      
      {settingsItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.settingItem}>
          <FontAwesome name={item.icon as any} size={24} color={item.color} />
          <Text style={styles.settingText}>{item.text}</Text>
          <FontAwesome name="chevron-right" size={20} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
});

export default SettingsSection;
