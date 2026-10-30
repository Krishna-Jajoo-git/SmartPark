import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Button from '../components/Button';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function ReceiptScreen({ route, navigation }) {
  const receipt = route?.params?.receipt;

  if (!receipt) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No receipt record available.</Text>
        <Button title="Go to Dashboard" onPress={() => navigation.navigate('DashboardTab')} />
      </View>
    );
  }

  const finalAmount = receipt.totalAmount !== undefined ? receipt.totalAmount : (receipt.finalAmount || 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Animated-Style Glowing Success Badge */}
        <View style={styles.successBadgeContainer}>
          <View style={styles.iconGlowRing}>
            <Ionicons name="checkmark-done" size={48} color={THEME.colors.available} />
          </View>
          <Text style={styles.successTitle}>Transaction Settled!</Text>
          <Text style={styles.successSub}>Parking space automatically released to VACANT</Text>
        </View>

        {/* Futuristic Digital Ticket Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.companyName}>SMARTPARK SMART FACILITY</Text>
            <Text style={styles.ticketType}>DIGITAL AUDIT RECEIPT</Text>
            <View style={styles.txnPill}>
              <Text style={styles.txnPillText}>
                REF: {receipt.transactionReference || `TXN-${receipt.bookingId || 1}`}
              </Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Details */}
          <View style={styles.row}>
            <Text style={styles.label}>Vehicle License Plate</Text>
            <Text style={styles.valBold}>{receipt.vehicleNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Bay Released</Text>
            <Text style={[styles.valBold, { color: THEME.colors.available }]}>
              {receipt.slotNumber} (Floor {receipt.slotFloor || receipt.floor || '1'})
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Booking Reference</Text>
            <Text style={styles.val}>#{receipt.bookingId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Entry Timestamp</Text>
            <Text style={styles.val}>{formatDateTime(receipt.entryTime)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Exit Timestamp</Text>
            <Text style={styles.val}>{formatDateTime(receipt.exitTime)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Elapsed Duration</Text>
            <Text style={styles.valBold}>{receipt.durationFormatted || '0s'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Settlement Mode</Text>
            <Text style={styles.val}>{receipt.paymentMethod || 'UPI'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Status</Text>
            <View style={styles.paidBadge}>
              <Text style={styles.paidBadgeText}>VERIFIED PAID</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Amount Paid Spotlight */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL AMOUNT PAID</Text>
            <Text style={styles.totalVal}>{formatCurrency(finalAmount)}</Text>
          </View>

          <Text style={styles.watermark}>
            Recorded in PostgreSQL • Transaction Immutable
          </Text>
        </View>
      </ScrollView>

      {/* Pinned Bottom Action Bar */}
      <View style={styles.pinnedBottomBar}>
        <Button
          title="Return to Command Center"
          onPress={() => navigation.navigate('DashboardTab')}
          variant="primary"
          iconName="home-outline"
        />
        <Button
          title="Inspect Parking Bays"
          onPress={() => navigation.navigate('SlotsTab')}
          variant="glass"
          iconName="grid-outline"
          style={{ marginTop: THEME.spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingTop: THEME.spacing.xxxl,
    paddingBottom: THEME.spacing.xxxl + 20,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: THEME.spacing.xl,
    backgroundColor: THEME.colors.background,
  },
  errorText: {
    fontSize: 16,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.lg,
  },
  successBadgeContainer: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  iconGlowRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.availableLight,
    borderWidth: 2,
    borderColor: THEME.colors.availableBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  successTitle: {
    ...THEME.typography.hero,
    color: THEME.colors.textPrimary,
  },
  successSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  ticketCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.medium,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: THEME.colors.accent,
  },
  ticketType: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  txnPill: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginTop: 8,
  },
  txnPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
    fontFamily: 'monospace',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
    borderStyle: 'dashed',
    marginVertical: THEME.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  val: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
  },
  valBold: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.5,
  },
  paidBadge: {
    backgroundColor: THEME.colors.availableLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.availableBorder,
  },
  paidBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.available,
    letterSpacing: 0.5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textPrimary,
  },
  totalVal: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.available,
  },
  watermark: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: THEME.spacing.md,
    fontStyle: 'italic',
  },
  buttonStack: {
    gap: 8,
  },
  pinnedBottomBar: {
    backgroundColor: '#161920',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 184, 105, 0.18)',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : THEME.spacing.md,
    gap: 8,
    ...THEME.shadows.medium,
  },
});
