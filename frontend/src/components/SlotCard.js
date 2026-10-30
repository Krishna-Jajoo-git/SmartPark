import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

export default function SlotCard({ slot, onPress, isSelected }) {
  const isAvailable = slot.status === 'AVAILABLE';
  const isFourWheeler = slot.vehicleType === 'FOUR_WHEELER';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isAvailable ? styles.availableCard : styles.occupiedCard,
        isSelected && styles.selectedCard,
      ]}
      onPress={() => onPress && onPress(slot)}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <View style={styles.slotIdentifier}>
          <Text style={[styles.slotNumber, isAvailable ? styles.textAvailable : styles.textOccupied]}>
            {slot.slotNumber}
          </Text>
        </View>

        <View style={[styles.statusBadge, isAvailable ? styles.badgeAvailable : styles.badgeOccupied]}>
          <View style={[styles.statusDot, isAvailable ? styles.dotAvailable : styles.dotOccupied]} />
          <Text style={[styles.statusBadgeText, isAvailable ? styles.textAvailable : styles.textOccupied]}>
            {isAvailable ? 'FREE' : 'PARKED'}
          </Text>
        </View>
      </View>

      <View style={styles.middleRow}>
        <View style={styles.chip}>
          <Ionicons
            name={isFourWheeler ? 'car-outline' : 'bicycle-outline'}
            size={13}
            color={THEME.colors.textSecondary}
          />
          <Text style={styles.chipText}>{isFourWheeler ? '4W' : '2W'}</Text>
        </View>

        <View style={styles.chip}>
          <Ionicons name="layers-outline" size={13} color={THEME.colors.textMuted} />
          <Text style={styles.chipText} numberOfLines={1}>{slot.floor || 'Floor 1'}</Text>
        </View>
      </View>

      {/* Vehicle Plate or Vacant Callout */}
      {!isAvailable && slot.currentVehicleNumber ? (
        <View style={styles.occupiedInfo}>
          <Ionicons name="car-sport" size={14} color={THEME.colors.occupied} />
          <Text style={styles.vehiclePlate} numberOfLines={1}>
            {slot.currentVehicleNumber}
          </Text>
        </View>
      ) : (
        <View style={styles.vacantAction}>
          <Ionicons name="add-circle-outline" size={13} color={THEME.colors.available} />
          <Text style={styles.vacantText}>Tap to Allocate</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.soft,
  },
  availableCard: {
    borderColor: THEME.colors.availableBorder,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
  },
  occupiedCard: {
    borderColor: THEME.colors.occupiedBorder,
    backgroundColor: 'rgba(244, 63, 94, 0.05)',
  },
  selectedCard: {
    borderColor: THEME.colors.accent,
    borderWidth: 2,
    backgroundColor: THEME.colors.accentSoft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotIdentifier: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotNumber: {
    ...THEME.typography.h2,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  badgeAvailable: {
    backgroundColor: THEME.colors.availableLight,
    borderWidth: 1,
    borderColor: THEME.colors.availableBorder,
  },
  badgeOccupied: {
    backgroundColor: THEME.colors.occupiedLight,
    borderWidth: 1,
    borderColor: THEME.colors.occupiedBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotAvailable: {
    backgroundColor: THEME.colors.available,
  },
  dotOccupied: {
    backgroundColor: THEME.colors.occupied,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textAvailable: {
    color: THEME.colors.available,
  },
  textOccupied: {
    color: THEME.colors.occupied,
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  occupiedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.occupiedBorder,
  },
  vehiclePlate: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.8,
  },
  vacantAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
  },
  vacantText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.available,
  },
});
