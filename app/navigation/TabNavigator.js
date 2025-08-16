import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import WordSetsPage from '../screens/WordSetsPage';
import PracticeScreen from '../screens/PracticeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WordLearnScreen from '../screens/WordLearnScreen';
import FlashcardScreen from '../screens/FlashcardScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function WordSetsStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        presentation: 'card',
        animation: 'slide_from_right'
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

  const defaultTabBarStyle = {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 30,
    alignItems:'center',
    marginHorizontal:20,
    justifyContent:'center',
    backgroundColor: bottomBarColor,
    borderRadius: 24,
    height: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  };

  return (
    <Tab.Navigator 
      initialRouteName="Home" 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: defaultTabBarStyle,
        tabBarActiveTintColor: '#CFEBF9',
        tabBarInactiveTintColor: '#FFFF',
        tabBarLabelStyle: { fontSize: 12, marginTop: 2 },
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
        options={({ route }) => {
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