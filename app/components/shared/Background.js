import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

export default function Background({ colors, children }) {
  return (
    <>
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" translucent />
      {children}
    </>
  );
}
