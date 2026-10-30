import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import Button from '../components/Button';
import LoadingIndicator from '../components/LoadingIndicator';
import { slotsApi } from '../api/slotsApi';
import { bookingsApi } from '../api/bookingsApi';
import { cleanVehicleNumber } from '../utils/formatters';

export default function BookingScreen({ route, navigation }) {
  const preselectedSlotId = route?.params?.preselectedSlotId;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('FOUR_WHEELER'); // 'FOUR_WHEELER' | 'TWO_WHEELER'
  const [selectedSlotId, setSelectedSlotId] = useState(preselectedSlotId || null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadAvailableSlots();
  }, []);

  useEffect(() => {
    if (preselectedSlotId) {
      setSelectedSlotId(preselectedSlotId);
    }
  }, [preselectedSlotId]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      const data = await slotsApi.getAvailableSlots();
      setAvailableSlots(data);
    } catch (err) {
      Alert.alert('Error', 'Unable to fetch available parking slots: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = (text) => {
    setErrorMessage('');
    setVehicleNumber(cleanVehicleNumber(text));
  };

  const validateInput = () => {
    const clean = vehicleNumber.trim();
    if (!clean) {
      setErrorMessage('Vehicle registration number is required');
      return false;
    }
    if (clean.length < 4 || clean.length > 15) {
      setErrorMessage('Vehicle number must be between 4 and 15 alphanumeric characters');
      return false;
    }
    return true;
  };

  const handleBookingSubmit = async () => {
    if (!validateInput()) return;

    try {
      setSubmitting(true);
      setErrorMessage('');

      const payload = {
        vehicleNumber: vehicleNumber.trim(),
        slotId: selectedSlotId || null,
      };

      const booking = await bookingsApi.createBooking(payload);

      Alert.alert(
        'Allocation Successful!',
        `Vehicle ${booking.vehicleNumber} successfully allocated to Slot ${booking.slotNumber}.\nTimer is now actively running.`,
        [
          {
            text: 'View Live Meters',
            onPress: () => {
              setVehicleNumber('');
              setSelectedSlotId(null);
              navigation.navigate('ActiveBookingsTab');
            },
          },
          {
            text: 'Dashboard',
            style: 'cancel',
            onPress: () => {
              setVehicleNumber('');
              setSelectedSlotId(null);
              navigation.navigate('DashboardTab');
            },
          },
        ]
      );
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && availableSlots.length === 0) {
    return <LoadingIndicator message="Finding vacant parking bays..." />;
  }

  // Filter slots (if slot specifically designates a vehicleType, filter by it; otherwise all vacant slots match)
  const matchingSlots = availableSlots.filter(
    (s) => !s.vehicleType || s.vehicleType === vehicleType
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Vehicle Entry"
        subtitle="Automatic or Manual Slot Allocation"
        badgeText={`${availableSlots.length} Vacant`}
        onRefresh={loadAvailableSlots}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={THEME.colors.occupied} />
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Vehicle Classification Tabs */}
        <View style={styles.categoryCard}>
          <Text style={styles.cardHeaderLabel}>SELECT VEHICLE CATEGORY</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.categoryOption, vehicleType === 'FOUR_WHEELER' && styles.categoryOptionActive]}
              onPress={() => { setVehicleType('FOUR_WHEELER'); setSelectedSlotId(null); }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="car"
                size={22}
                color={vehicleType === 'FOUR_WHEELER' ? THEME.colors.accent : THEME.colors.textMuted}
              />
              <Text style={[styles.categoryTitle, vehicleType === 'FOUR_WHEELER' && styles.categoryTitleActive]}>
                4-Wheeler Car
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryOption, vehicleType === 'TWO_WHEELER' && styles.categoryOptionActive]}
              onPress={() => { setVehicleType('TWO_WHEELER'); setSelectedSlotId(null); }}
              activeOpacity={0.8}
            >
              <Ionicons
                name="bicycle"
                size={22}
                color={vehicleType === 'TWO_WHEELER' ? THEME.colors.accent : THEME.colors.textMuted}
              />
              <Text style={[styles.categoryTitle, vehicleType === 'TWO_WHEELER' && styles.categoryTitleActive]}>
                2-Wheeler Bike
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* License Plate Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderLabel}>VEHICLE REGISTRATION PLATE</Text>
          <View style={styles.plateInputContainer}>
            <View style={styles.indBadge}>
              <Text style={styles.indText}>IND</Text>
            </View>
            <TextInput
              style={styles.plateInput}
              placeholder="e.g. MH12DE4321"
              placeholderTextColor={THEME.colors.textMuted}
              value={vehicleNumber}
              onChangeText={handleVehicleChange}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={15}
            />
            {vehicleNumber.length > 0 && (
              <TouchableOpacity onPress={() => setVehicleNumber('')}>
                <Ionicons name="close-circle" size={20} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.helperText}>Standard Indian registration (state code + district + series + digits)</Text>
        </View>

        {/* Space Allocation Selection */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardHeaderLabel}>BAY ALLOCATION METHOD</Text>
            <Text style={styles.matchingCounter}>{matchingSlots.length} matching bays</Text>
          </View>

          {/* Auto Assign Mode */}
          <TouchableOpacity
            style={[
              styles.allocationOption,
              selectedSlotId === null && styles.allocationOptionActive,
            ]}
            onPress={() => setSelectedSlotId(null)}
            activeOpacity={0.8}
          >
            <View style={styles.optionLeft}>
              <View style={[styles.radioCircle, selectedSlotId === null && styles.radioCircleActive]} />
              <View>
                <Text style={styles.optionMain}>Auto-Assign Optimal Bay</Text>
                <Text style={styles.optionSub}>System automatically assigns the nearest vacant bay</Text>
              </View>
            </View>
            <Ionicons
              name="sparkles"
              size={20}
              color={selectedSlotId === null ? THEME.colors.accent : THEME.colors.textMuted}
            />
          </TouchableOpacity>

          {/* Manual Slot Grid */}
          <Text style={[styles.subLabel, { marginTop: THEME.spacing.md }]}>Or Choose a Preferred Bay:</Text>
          {matchingSlots.length === 0 ? (
            <View style={styles.fullBox}>
              <Ionicons name="alert-circle-outline" size={20} color={THEME.colors.occupied} />
              <Text style={styles.fullBoxText}>No vacant bays available for {vehicleType === 'FOUR_WHEELER' ? '4-Wheelers' : '2-Wheelers'}.</Text>
            </View>
          ) : (
            <View style={styles.slotGridWrap}>
              {matchingSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotPill,
                      isSelected && styles.slotPillActive,
                    ]}
                    onPress={() => setSelectedSlotId(slot.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.slotPillNum, isSelected && styles.slotPillNumActive]}>
                      {slot.slotNumber}
                    </Text>
                    <Text style={[styles.slotPillFloor, isSelected && styles.slotPillFloorActive]}>
                      {slot.floor?.includes('Basement') ? 'BASEMENT' : slot.floor?.includes('South') ? 'SOUTH' : 'NORTH'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Pricing Transparency Summary */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Tariff Rate</Text>
            <Text style={styles.summaryVal}>₹50 per 3-hour tier</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Initial Charge</Text>
            <Text style={[styles.summaryVal, { color: THEME.colors.available }]}>₹0 at entry (pay on exit)</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pinned Bottom Action Bar */}
      <View style={styles.pinnedBottomBar}>
        <Button
          title={submitting ? 'Allocating Bay...' : 'Confirm Vehicle Parking'}
          onPress={handleBookingSubmit}
          loading={submitting}
          disabled={matchingSlots.length === 0}
          iconName="checkmark-circle"
          style={styles.submitBtn}
        />
      </View>
    </KeyboardAvoidingView>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.occupiedLight,
    borderWidth: 1,
    borderColor: THEME.colors.occupiedBorder,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    marginBottom: THEME.spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#F87171',
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  cardHeaderLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  categoryOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingVertical: 12,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  categoryOptionActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accentSoft,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  categoryTitleActive: {
    color: THEME.colors.textPrimary,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  matchingCounter: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.available,
  },
  plateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161920',
    borderWidth: 1.5,
    borderColor: THEME.colors.borderStrong,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  indBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 10,
  },
  indText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#121417',
  },
  plateInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  helperText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 6,
  },
  allocationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
  },
  allocationOptionActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accentSoft,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: THEME.colors.borderStrong,
    backgroundColor: THEME.colors.surface,
  },
  radioCircleActive: {
    borderColor: THEME.colors.accent,
    backgroundColor: THEME.colors.accent,
  },
  optionMain: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  optionSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
  },
  fullBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.occupiedLight,
  },
  fullBoxText: {
    fontSize: 12,
    color: THEME.colors.occupied,
    fontWeight: '600',
    flex: 1,
  },
  slotGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotPill: {
    width: '23%',
    paddingVertical: 8,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPillActive: {
    backgroundColor: THEME.colors.accentDeep,
    borderColor: THEME.colors.accent,
  },
  slotPillNum: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  slotPillNumActive: {
    color: THEME.colors.textLight,
  },
  slotPillFloor: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  slotPillFloorActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  summaryBox: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.md,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryKey: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  summaryVal: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  submitBtn: {
    backgroundColor: THEME.colors.accentDeep,
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
