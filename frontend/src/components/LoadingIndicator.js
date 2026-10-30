import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';

export default function LoadingIndicator({ message = 'Synchronizing with SmartPark...' }) {
  return (
    <View style={styles.container}>
      <View style={styles.pulseContainer}>
        <ActivityIndicator size="large" color={THEME.colors.accent} />
      </View>
      <Text style={styles.text}>{message}</Text>
      <Text style={styles.subText}>REAL-TIME PARKING SYSTEM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
    backgroundColor: THEME.colors.background,
  },
  pulseContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: THEME.colors.accentSoft,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  text: {
    ...THEME.typography.bodyMedium,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  subText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: THEME.colors.accent,
    marginTop: 6,
  },
});
