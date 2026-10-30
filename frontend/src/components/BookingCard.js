import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { useLiveTimer } from '../utils/useLiveTimer';

export default function BookingCard({ booking, onCheckout, onPress }) {
  const { formattedTime, liveFare, tierProgressPercent } = useLiveTimer(booking.entryTime);
  const displayFare = liveFare || booking.accruedFare || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress && onPress(booking)}
    >
      {/* Top Banner: License Plate & Live Accrued Fare */}
      <View style={styles.topRow}>
        <View style={styles.vehicleSection}>
          <View style={styles.plateContainer}>
            <View style={styles.plateIndBadge}>
              <Text style={styles.plateIndText}>IND</Text>
            </View>
            <Text style={styles.plateNumber}>{booking.vehicleNumber}</Text>
          </View>
          <Text style={styles.bookingSubText}>
            Booking #{booking.id}{booking.slotFloor ? ` • ${booking.slotFloor}` : ''}{booking.vehicleType ? ` • ${booking.vehicleType === 'FOUR_WHEELER' ? '4-Wheeler' : '2-Wheeler'}` : ''}
          </Text>
        </View>

        <View style={styles.fareContainer}>
          <Text style={styles.fareLabel}>ACCRUED FARE</Text>
          <Text style={styles.fareAmount}>{formatCurrency(displayFare)}</Text>
        </View>
      </View>

      {/* Live Duration Ticker */}
      <View style={styles.liveTimerRow}>
        <View style={styles.liveBeacon}>
          <View style={styles.beaconPulse} />
          <Ionicons name="time-outline" size={14} color={THEME.colors.accent} />
          <Text style={styles.liveTimerLabel}>Elapsed:</Text>
          <Text style={styles.liveTimerValue}>{formattedTime}</Text>
        </View>
        <View style={styles.slotPill}>
          <Ionicons name="location-sharp" size={12} color={THEME.colors.textPrimary} />
          <Text style={styles.slotPillText}>Slot {booking.slotNumber}</Text>
        </View>
      </View>

      {/* Tier Progress Bar */}
      <View style={styles.tierContainer}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierLabel}>3-Hour Billing Block Progress</Text>
          <Text style={styles.tierPercent}>{tierProgressPercent}%</Text>
        </View>
        <View style={styles.tierTrack}>
          <View style={[styles.tierFill, { width: `${tierProgressPercent}%` }]} />
        </View>
      </View>

      {/* Timestamp Details */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="enter-outline" size={13} color={THEME.colors.textMuted} />
          <Text style={styles.metaText}>Parked at: {formatDateTime(booking.entryTime)}</Text>
        </View>
      </View>

      {/* Action Button */}
      {onCheckout && (
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => onCheckout(booking)}
          activeOpacity={0.8}
        >
          <Ionicons name="card-outline" size={16} color="#121417" />
          <Text style={styles.checkoutBtnText}>Checkout & Settle Fare</Text>
          <Ionicons name="chevron-forward" size={16} color="#121417" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.lg,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.medium,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  vehicleSection: {
    flex: 1,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: THEME.colors.borderStrong,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 6,
  },
  plateIndBadge: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  plateIndText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#93C5FD',
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  bookingSubText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  fareContainer: {
    alignItems: 'flex-end',
    backgroundColor: THEME.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
  },
  fareLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.accent,
    letterSpacing: 0.5,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.accent,
  },
  liveTimerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  liveBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  beaconPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.available,
  },
  liveTimerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  liveTimerValue: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    fontFamily: 'monospace',
  },
  slotPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  slotPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  tierContainer: {
    marginBottom: THEME.spacing.sm,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tierLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  tierPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  tierTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.surfaceHighlight,
    overflow: 'hidden',
  },
  tierFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.accent,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: THEME.borderRadius.md,
    gap: 8,
  },
  checkoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#121417',
    letterSpacing: 0.3,
  },
});
