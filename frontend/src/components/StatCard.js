import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function StatCard({ title, value, icon, iconColor, subtitle, badge, style }) {
  const accentColor = iconColor || THEME.colors.accent;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}40` }]}>
            <Ionicons name={icon} size={18} color={accentColor} />
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {badge && (
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      
      {/* Subtle bottom accent line */}
      <View style={[styles.bottomGlow, { backgroundColor: accentColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...THEME.shadows.soft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  value: {
    ...THEME.typography.h1,
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  badgeWrap: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    left: THEME.spacing.lg,
    right: THEME.spacing.lg,
    height: 2,
    opacity: 0.35,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
});
