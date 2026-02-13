import React, { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

interface BackgroundProps {
  colors: readonly string[];
  children?: ReactNode;
}

export default function Background({ colors, children }: BackgroundProps) {
  return (
    <>
      <LinearGradient colors={colors as any} style={StyleSheet.absoluteFill} />
      <StatusBar style="light" translucent />
      {children}
    </>
  );
}
