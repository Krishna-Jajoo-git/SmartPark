import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import { bookingsApi } from '../api/bookingsApi';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export default function CheckoutScreen({ route, navigation }) {
  const bookingId = route?.params?.bookingId;

  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Error', 'Missing booking identifier');
      navigation.goBack();
      return;
    }
    loadFareEstimate();
  }, [bookingId]);

  const loadFareEstimate = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getFareEstimate(bookingId);
      setEstimate(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to calculate fare estimate: ' + err.message);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckout = async () => {
    try {
      setCheckingOut(true);
      const receipt = await bookingsApi.checkout(bookingId, selectedMethod);
      navigation.replace('Receipt', { receipt });
    } catch (err) {
      Alert.alert('Checkout Failed', err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading || !estimate) {
    return <LoadingIndicator message="Calculating final parking fee..." />;
  }

  const durationSec = estimate.durationSeconds || estimate.durationInSeconds || 0;
  const blocks = durationSec === 0 ? 0 : Math.ceil(durationSec / 10800);
  const fare = estimate.fareAmount !== undefined ? estimate.fareAmount : (estimate.accruedFare || 0);

  return (
    <View style={styles.container}>
      <Header
        title="Checkout Terminal"
        subtitle={`Booking #${estimate.bookingId || bookingId}`}
        badgeText="BILLING"
        onRefresh={loadFareEstimate}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Vehicle & Bay Identifier Card */}
        <View style={styles.card}>
          <View style={styles.vehicleHeader}>
            <View style={styles.plateContainer}>
              <View style={styles.plateInd}>
                <Text style={styles.plateIndText}>IND</Text>
              </View>
              <Text style={styles.plateText}>{estimate.vehicleNumber}</Text>
            </View>
            <View style={styles.bayPill}>
              <Ionicons name="location" size={12} color={THEME.colors.accent} />
              <Text style={styles.bayPillText}>Slot {estimate.slotNumber}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeGrid}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>ENTRY TIME</Text>
              <Text style={styles.timeValue}>{formatDateTime(estimate.entryTime)}</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>EXIT TIME</Text>
              <Text style={styles.timeValue}>{formatDateTime(estimate.currentTime)}</Text>
            </View>
          </View>

          <View style={styles.durationBanner}>
            <Ionicons name="time" size={18} color={THEME.colors.accent} />
            <Text style={styles.durationText}>
              Duration: <Text style={styles.durationBold}>{estimate.durationFormatted}</Text>
            </Text>
          </View>
        </View>

        {/* Tariff Itemization Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>TARIFF BREAKDOWN</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Unit Rate</Text>
            <Text style={styles.fareVal}>₹50.00 / 3 hr block</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Billable Tier Blocks</Text>
            <Text style={styles.fareVal}>{blocks} {blocks === 1 ? 'block' : 'blocks'}</Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Formula</Text>
            <Text style={styles.formulaText}>ceil({durationSec}s / 10800s) × ₹50</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Payable Total</Text>
            <Text style={styles.totalAmount}>{formatCurrency(fare)}</Text>
          </View>
        </View>

        {/* Payment Mode Selector */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>SELECT PAYMENT METHOD</Text>

          {[
            { id: 'UPI', label: 'Instant UPI (GPay / PhonePe / QR)', icon: 'qr-code-outline' },
            { id: 'CARD', label: 'Debit / Credit Card (POS Terminal)', icon: 'card-outline' },
            { id: 'CASH', label: 'Cash Counter Settlement', icon: 'cash-outline' },
            { id: 'NET_BANKING', label: 'Net Banking / Corporate', icon: 'globe-outline' },
          ].map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodOption, isSelected && styles.methodOptionActive]}
                onPress={() => setSelectedMethod(m.id)}
                activeOpacity={0.8}
              >
                <View style={styles.methodLeft}>
                  <Ionicons
                    name={m.icon}
                    size={20}
                    color={isSelected ? THEME.colors.accent : THEME.colors.textSecondary}
                  />
                  <Text style={[styles.methodText, isSelected && styles.methodTextActive]}>
                    {m.label}
                  </Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Pinned Bottom Action Bar */}
      <View style={styles.pinnedBottomBar}>
        <Button
          title={checkingOut ? 'Settling Payment...' : `Confirm & Release Slot (${formatCurrency(fare)})`}
          onPress={handleConfirmCheckout}
          loading={checkingOut}
          variant="success"
          iconName="checkmark-done"
          style={styles.payBtn}
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
    paddingBottom: THEME.spacing.xxxl + 20,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.medium,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161920',
    borderWidth: 1.5,
    borderColor: THEME.colors.borderStrong,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  plateInd: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  plateIndText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#121417',
  },
  plateText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  bayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
  },
  bayPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.md,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  timeBox: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: 10,
    borderRadius: THEME.borderRadius.md,
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  durationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.accentSoft,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
  },
  durationText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
  },
  durationBold: {
    fontWeight: '800',
    color: THEME.colors.accent,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.md,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  fareKey: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  fareVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  formulaText: {
    fontSize: 11,
    color: THEME.colors.accent,
    fontFamily: 'monospace',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.available,
  },
  methodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: 8,
  },
  methodOptionActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accentSoft,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  methodTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '800',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.borderStrong,
  },
  radioCircleActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accent,
  },
  payBtn: {
    backgroundColor: '#059669',
  },
  pinnedBottomBar: {
    backgroundColor: '#161920',
    borderTopWidth: 1,
    borderTopColor: 'rgba(229, 184, 105, 0.18)',
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : THEME.spacing.md,
    ...THEME.shadows.medium,
  },
});
