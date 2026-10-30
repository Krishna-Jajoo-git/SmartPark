import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function Header({ title, subtitle, onRefresh, rightAction, badgeText, onBack }) {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <View style={styles.leftContainer}>
          <View style={styles.brandRow}>
            {onBack && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={18} color={THEME.colors.accent} />
              </TouchableOpacity>
            )}
            <View style={styles.logoBadge}>
              <Ionicons name="car-sport" size={18} color={THEME.colors.accent} />
            </View>
            <Text style={styles.brandTitle}>SMARTPARK</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          {badgeText && (
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{badgeText}</Text>
            </View>
          )}

          {onRefresh && (
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={onRefresh}
              activeOpacity={0.7}
            >
              <Ionicons name="sync-outline" size={18} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          )}

          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surfaceGlass,
    paddingTop: THEME.spacing.xl,
    paddingBottom: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderStrong,
    ...THEME.shadows.medium,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContainer: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: THEME.colors.accentSoft,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: THEME.colors.accent,
    letterSpacing: 1.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.availableLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.availableBorder,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.available,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.available,
    letterSpacing: 0.5,
  },
  pageTitle: {
    ...THEME.typography.hero,
    color: THEME.colors.textPrimary,
  },
  pageSubtitle: {
    ...THEME.typography.caption,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
