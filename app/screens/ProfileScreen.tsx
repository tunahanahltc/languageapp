import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColorProperties } from '../constants/themes';
import { useAuth } from '../contexts/AuthContext';
import Background from '../components/shared/Background';
import ProfileHeader from '../components/ProfileScreen/ProfileHeader';
import ThemeSelector from '../components/ProfileScreen/ThemeSelector';
import SettingsSection from '../components/ProfileScreen/SettingsSection';
import ProfileThemeModal from '../components/ProfileScreen/ProfileThemeModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ProfileScreenNavigationProp } from '../types';

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { currentTheme, themeColors, changeTheme } = useTheme();
  const colorProps = getThemeColorProperties(currentTheme);
  const { userProfile, logout, loading } = useAuth();
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const handleLogout = (): void => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <ProfileHeader />

        <ScrollView style={styles.content}>
          {/* Kullanıcı Bilgileri */}
          <View style={[styles.userInfoSection, { backgroundColor: colorProps.cardBackground }]}>
            <View style={styles.avatarContainer}>
              <Icon name="user-circle" size={60} color={colorProps.primary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colorProps.text }]}>
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.username || 'Kullanıcı'
                }
              </Text>
              <Text style={[styles.userEmail, { color: colorProps.textSecondary }]}>
                {userProfile?.email || 'email@example.com'}
              </Text>
              <Text style={[styles.userLevel, { color: colorProps.primary }]}>
                Seviye {userProfile?.user_level || 1}
              </Text>
            </View>
          </View>

          {/* İstatistikler */}
          <View style={[styles.statsSection, { backgroundColor: colorProps.cardBackground }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorProps.primary }]}>
                {userProfile?.learned_word_count || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colorProps.textSecondary }]}>
                Öğrenilen Kelime
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorProps.primary }]}>
                {userProfile?.current_streak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colorProps.textSecondary }]}>
                Günlük Seri
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colorProps.primary }]}>
                {userProfile?.experiment_score || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colorProps.textSecondary }]}>
                Puan
              </Text>
            </View>
          </View>

          <ThemeSelector
            currentTheme={currentTheme}
            themeColors={themeColors}
            onPress={() => setMenuVisible(true)}
          />

          <SettingsSection />

          {/* Çıkış Butonu */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colorProps.error }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <Icon name="sign-out" size={20} color="white" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>
              {loading ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <ProfileThemeModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          currentTheme={currentTheme}
          onThemeChange={changeTheme}
        />
      </Background>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
