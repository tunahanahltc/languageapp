import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export default function ModernLoadingState() {
  const { themeColors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Ionicons name="library-outline" size={48} color="rgba(255,255,255,0.8)" />
        </View>
        <Text style={[styles.title, { color: '#fff' }]}>
          Kütüphane yükleniyor
        </Text>
        <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.7)' }]}>
          Hikayeleriniz hazırlanıyor...
        </Text>
        
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
          <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
          <View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
