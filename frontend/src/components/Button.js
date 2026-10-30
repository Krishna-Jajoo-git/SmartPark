import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function Button({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'glass'
  loading = false,
  disabled = false,
  iconName,
  style,
  textStyle,
}) {
  const getBackgroundColor = () => {
    if (disabled) return THEME.colors.surfaceSubtle;
    switch (variant) {
      case 'primary': return THEME.colors.accent;
      case 'secondary': return THEME.colors.surfaceSubtle;
      case 'danger': return THEME.colors.occupied;
      case 'success': return THEME.colors.available;
      case 'glass': return THEME.colors.surfaceGlass;
      case 'outline': return 'transparent';
      default: return THEME.colors.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return THEME.colors.textMuted;
    if (variant === 'primary') return '#121417'; // Sharp Charcoal text on Sand Yellow
    if (variant === 'outline') return THEME.colors.accent;
    if (variant === 'secondary') return THEME.colors.accent;
    return '#FFFFFF';
  };

  const isOutline = variant === 'outline';
  const isGlass = variant === 'glass';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        isOutline && styles.outline,
        isGlass && styles.glass,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={getTextColor()}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: THEME.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.soft,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...THEME.typography.bodyMedium,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: THEME.colors.accent,
  },
  glass: {
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
  },
  disabled: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});
