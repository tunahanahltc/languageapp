import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, ViewStyle, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { getFocusedRouteNameFromRoute, RouteProp } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import WordSetsPage from '../screens/WordSetsPage';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WordLearnScreen from '../screens/WordLearnScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator();

function WordSetsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card'
      }}
    >
      <Stack.Screen name="WordSetsMain" component={WordSetsPage} />
      <Stack.Screen name="WordLearnScreen" component={WordLearnScreen} />
      <Stack.Screen name="FlashcardScreen" component={FlashcardScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  const { bottomBarColor } = useTheme();
  const insets = useSafeAreaInsets();

  const defaultTabBarStyle: ViewStyle = {
    position: 'absolute',
    left: 20,
    right: 20,
    // insets.bottom sistem çubuğu (veya home indicator) varsa değer döndürür, yoksa 0'dır.
    // Her durumda çubuğun biraz yukarıda (floating) durması için +15/20 ekliyoruz.
    bottom: (insets.bottom > 0 ? insets.bottom : 15) + (Platform.OS === 'android' ? 5 : 0),
    backgroundColor: bottomBarColor,
    borderRadius: 28,
    height: 72,
    paddingBottom: 0,
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: defaultTabBarStyle,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 10,
        },
        tabBarIconStyle: {
          marginTop: 10,
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 0.8, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="WordSets"
        component={WordSetsStack}
        options={({ route }: { route: RouteProp<MainTabParamList, 'WordSets'> }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'WordSetsMain';
          const shouldHideTabBar = routeName === 'WordLearnScreen' || routeName === 'FlashcardScreen';
          return {
            tabBarLabel: 'Kelime Setleri',
            tabBarIcon: ({ color, size }) => (
              <Text style={{ fontSize: size * 0.8, color }}>📚</Text>
            ),
            tabBarStyle: shouldHideTabBar ? { display: 'none' } : defaultTabBarStyle,
          };
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{
          tabBarLabel: 'Pratik Yap',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 0.8, color }}>🎮</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size * 0.8, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
