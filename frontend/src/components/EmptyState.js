import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Button from './Button';

export default function EmptyState({
  icon = 'file-tray-outline',
  title = 'No Data Found',
  description = 'There are no records to display at this moment.',
  actionTitle,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={THEME.colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xxxl,
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginVertical: THEME.spacing.lg,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: THEME.colors.accentSoft,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    ...THEME.typography.h2,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '800',
  },
  description: {
    ...THEME.typography.body,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
    maxWidth: 320,
    lineHeight: 20,
  },
  actionBtn: {
    minWidth: 180,
  },
});
