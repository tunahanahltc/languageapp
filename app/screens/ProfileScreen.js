import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Background from '../components/shared/Background';
import ProfileHeader from '../components/ProfileScreen/ProfileHeader';
import ThemeSelector from '../components/ProfileScreen/ThemeSelector';
import SettingsSection from '../components/ProfileScreen/SettingsSection';
import ProfileThemeModal from '../components/ProfileScreen/ProfileThemeModal';

export default function ProfileScreen({ navigation }) {
  const { currentTheme, themeColors, changeTheme } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Background colors={themeColors}>
        <ProfileHeader />

        <ScrollView style={styles.content}>
          <ThemeSelector
            currentTheme={currentTheme}
            themeColors={themeColors}
            onPress={() => setMenuVisible(true)}
          />

          <SettingsSection />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
}); 