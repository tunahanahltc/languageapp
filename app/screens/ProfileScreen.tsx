import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Dimensions, Image, Switch } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Background from '../components/shared/Background';
import ThemeSelector from '../components/ProfileScreen/ThemeSelector';
import ProfileThemeModal from '../components/ProfileScreen/ProfileThemeModal';
import TTSConfigModal from '../components/ProfileScreen/TTSConfigModal';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProfileScreenNavigationProp } from '../types';

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

import LocalDatabaseService from '../services/LocalDatabaseService';
import { DevSettings, NativeModules } from 'react-native';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { currentTheme, themeColors, changeTheme } = useTheme();
  const { userProfile, logout, loading } = useAuth();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [ttsModalVisible, setTtsModalVisible] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

  const handleLogout = () => {
    Alert.alert(
      'Çıkış',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış sırasında bir sorun oluştu.');
            }
          },
        },
      ]
    );
  };

  const StatItem = ({ label, value, color }: { label: string, value: string | number, color: string }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SettingsItem = ({ icon, title, value, onPress, isSwitch, iconColor }: { icon: any, title: string, value?: string, onPress?: () => void, isSwitch?: boolean, iconColor?: string }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={[styles.settingsIconContainer, { backgroundColor: iconColor ? `${iconColor}15` : '#F3F4F6' }]}>
        <Feather name={icon} size={20} color={iconColor || "#4B5563"} />
      </View>
      <Text style={styles.settingsTitle}>{title}</Text>

      {isSwitch ? (
        <Switch
          trackColor={{ false: "#E5E7EB", true: iconColor || "#10B981" }}
          thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
          onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
          value={notificationsEnabled}
        />
      ) : (
        <View style={styles.settingsRight}>
          {value && <Text style={styles.settingsValue}>{value}</Text>}
          <Feather name="chevron-right" size={18} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Minimal Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.4)']}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Text style={[styles.avatarText, { color: themeColors[2] }]}>
                    {(userProfile?.first_name?.[0] || userProfile?.username?.[0] || 'U').toUpperCase()}
                  </Text>
                </View>
              </LinearGradient>
              <TouchableOpacity style={[styles.editBadge, { backgroundColor: themeColors[2] }]}>
                <Feather name="camera" size={12} color={themeColors[0]} />
              </TouchableOpacity>
            </View>

            <Text style={styles.userName}>
              {userProfile?.first_name
                ? `${userProfile.first_name} ${userProfile.last_name || ''}`
                : userProfile?.username || 'Kullanıcı'}
            </Text>
            <Text style={styles.userEmail}>{userProfile?.email || 'email@example.com'}</Text>
          </View>

          {/* Combined Smooth Stats Bar */}
          <View style={styles.statsContainer}>
            <StatItem label="Kelime" value={userProfile?.learned_word_count || 0} color={themeColors[2]} />
            <View style={styles.statDivider} />
            <StatItem label="Günlük Seri" value={userProfile?.current_streak || 0} color={themeColors[2]} />
            <View style={styles.statDivider} />
            <StatItem label="Toplam Puan" value={userProfile?.experiment_score || 0} color={themeColors[2]} />
          </View>

          {/* Clean Settings List */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>GENEL</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon="layout"
                title="Görünüm"
                value={`${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`}
                onPress={() => setMenuVisible(true)}
                iconColor={themeColors[2]}
              />
              <View style={styles.itemSeparator} />
              <SettingsItem
                icon="bell"
                title="Bildirimler"
                isSwitch
                iconColor={themeColors[2]}
              />
              <View style={styles.itemSeparator} />
              <SettingsItem
                icon="globe"
                title="Dil Seçenekleri"
                value="Türkçe"
                onPress={() => { }}
                iconColor={themeColors[2]}
              />
              <View style={styles.itemSeparator} />
              <SettingsItem
                icon="volume-2"
                title="Ses Ayarları"
                value="Hız & Ton"
                onPress={() => setTtsModalVisible(true)}
                iconColor={themeColors[2]}
              />
            </View>

            <Text style={styles.sectionHeader}>HESAP</Text>
            <View style={styles.settingsGroup}>
              <SettingsItem
                icon="user"
                title="Profil Bilgileri"
                onPress={() => { }}
                iconColor={themeColors[2]}
              />
              <View style={styles.itemSeparator} />
              <SettingsItem
                icon="shield"
                title="Güvenlik"
                onPress={() => { }}
                iconColor={themeColors[2]}
              />
              <View style={styles.itemSeparator} />
              <SettingsItem
                icon="trash-2"
                title="Verileri ve Önbelleği Sıfırla"
                onPress={handleResetDatabase}
                iconColor="#EF4444"
              />
            </View>
          </View>

          {/* Minimal Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            <Text style={styles.logoutText}>{loading ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>v1.0.0</Text>
        </ScrollView>

        <ProfileThemeModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          currentTheme={currentTheme}
          onThemeChange={changeTheme}
        />

        <TTSConfigModal
          visible={ttsModalVisible}
          onClose={() => setTtsModalVisible(false)}
        />
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '600',
    // color handled inline
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor handled inline
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 32,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    // color handled inline
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // Settings
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    marginLeft: 12,
    letterSpacing: 1,
  },
  settingsGroup: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    // backgroundColor handled inline
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsTitle: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 44, // Align with text start
  },

  // Logout
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  logoutText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
});

export default ProfileScreen;
