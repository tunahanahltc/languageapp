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

import LocalDatabaseService from '../../services/LocalDatabaseService';
import { Alert } from 'react-native';
import { DevSettings, NativeModules } from 'react-native';

const SettingsSection: React.FC = () => {
  const handleResetDatabase = async () => {
    Alert.alert(
      "Verileri Sıfırla",
      "Tüm uygulama verileri (kelimeler, ilerleme, vb.) silinecek ve veritabanı sıfırlanacak. Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sıfırla",
          style: "destructive",
          onPress: async () => {
            try {
              await LocalDatabaseService.clearAllData();
              Alert.alert(
                "Başarılı",
                "Veritabanı sıfırlandı. Uygulama yeniden başlatılacak.",
                [{
                  text: "Tamam",
                  onPress: () => {
                    // Expo Reload
                    if (NativeModules.DevSettings) {
                      NativeModules.DevSettings.reload();
                    } else if (DevSettings) {
                      DevSettings.reload();
                    }
                  }
                }]
              );
            } catch (error) {
              Alert.alert("Hata", "Sıfırlama sırasında bir hata oluştu.");
              console.error(error);
            }
          }
        }
      ]
    );
  };

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

      <TouchableOpacity
        style={[styles.settingItem, { borderBottomWidth: 0, marginTop: 10 }]}
        onPress={handleResetDatabase}
      >
        <FontAwesome name="trash" size={24} color="#ef4444" />
        <Text style={[styles.settingText, { color: '#ef4444', fontWeight: 'bold' }]}>
          Verileri ve Önbelleği Sıfırla
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(130, 55, 55, 0.95)',
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
