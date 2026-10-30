import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import BookingCard from '../components/BookingCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { analyticsApi } from '../api/analyticsApi';
import { slotsApi } from '../api/slotsApi';
import { bookingsApi } from '../api/bookingsApi';
import { formatCurrency } from '../utils/formatters';

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [slots, setSlots] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [sumData, slotsData, activeData] = await Promise.all([
        analyticsApi.getSummary(),
        slotsApi.getAllSlots(),
        bookingsApi.getActiveBookings(),
      ]);
      setSummary(sumData);
      setSlots(slotsData);
      setActiveBookings(activeData.slice(0, 3)); // Top 3 for live stream
    } catch (err) {
      // Gentle toast fallback
      console.warn('Dashboard sync issue:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // Auto-sync dashboard every 10 seconds for real-time live data
    const syncInterval = setInterval(() => {
      loadData();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !summary) {
    return <LoadingIndicator message="Initializing SmartPark Command Center..." />;
  }

  const occupancyRate = summary?.occupancyRatePercentage || 0;
  const totalSlots = summary?.totalSlots || slots.length || 25;
  const availableSlots = summary?.availableSlots ?? 24;
  const occupiedSlots = summary?.occupiedSlots ?? 1;

  // Determine occupancy status color
  const statusColor =
    occupancyRate > 85
      ? THEME.colors.occupied
      : occupancyRate > 60
      ? THEME.colors.pending
      : THEME.colors.available;

  return (
    <View style={styles.container}>
      <Header
        title="Command Center"
        subtitle="Real-Time Smart Parking Operations"
        badgeText={`${availableSlots} Vacant`}
        onRefresh={onRefresh}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.accent}
            colors={[THEME.colors.accent]}
          />
        }
      >
        {/* Dynamic Occupancy Gauge Banner */}
        <View style={styles.occupancyBanner}>
          <View style={styles.occupancyHeaderRow}>
            <View>
              <Text style={styles.bannerSubTitle}>FACILITY UTILIZATION</Text>
              <Text style={[styles.bannerMainTitle, { color: statusColor }]}>
                {occupancyRate}% Full
              </Text>
            </View>
            <View style={[styles.statusGlowBadge, { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}40` }]}>
              <View style={[styles.pulsingDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusGlowText, { color: statusColor }]}>
                {occupancyRate > 85 ? 'HIGH DEMAND' : 'OPTIMAL'}
              </Text>
            </View>
          </View>

          {/* Segmented Progress Track */}
          <View style={styles.trackContainer}>
            <View style={[styles.trackFill, { width: `${occupancyRate}%`, backgroundColor: statusColor }]} />
          </View>

          <View style={styles.bannerStatsRow}>
            <View style={styles.miniStat}>
              <View style={[styles.miniDot, { backgroundColor: THEME.colors.available }]} />
              <Text style={styles.miniStatText}>Available: <Text style={styles.boldWhite}>{availableSlots}</Text></Text>
            </View>
            <View style={styles.miniStat}>
              <View style={[styles.miniDot, { backgroundColor: THEME.colors.occupied }]} />
              <Text style={styles.miniStatText}>Occupied: <Text style={styles.boldWhite}>{occupiedSlots}</Text></Text>
            </View>
            <View style={styles.miniStat}>
              <View style={[styles.miniDot, { backgroundColor: THEME.colors.textMuted }]} />
              <Text style={styles.miniStatText}>Total: <Text style={styles.boldWhite}>{totalSlots}</Text></Text>
            </View>
          </View>
        </View>

        {/* 4 Key Metrics Cards */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Available Spaces"
            value={availableSlots}
            icon="shield-checkmark"
            iconColor={THEME.colors.available}
            subtitle="Ready to park"
            badge="LIVE"
            style={styles.metricCard}
          />
          <StatCard
            title="Parked Vehicles"
            value={occupiedSlots}
            icon="car-sport"
            iconColor={THEME.colors.occupied}
            subtitle="Active parking"
            style={styles.metricCard}
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(summary?.todayRevenue || 0)}
            icon="wallet"
            iconColor={THEME.colors.accent}
            subtitle="Settled fees"
            style={styles.metricCard}
          />
          <StatCard
            title="Active Sessions"
            value={summary?.activeBookings ?? 0}
            icon="timer"
            iconColor={THEME.colors.neonViolet}
            subtitle="On-going meters"
            style={styles.metricCard}
          />
        </View>

        {/* Quick Actions Station */}
        <Text style={styles.sectionHeader}>QUICK ACTION TERMINAL</Text>
        <View style={styles.actionStationRow}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, styles.shadowAccent]}
            onPress={() => navigation.navigate('NewBooking')}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle" size={24} color={THEME.colors.accent} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionMainTitle}>Book a Space</Text>
              <Text style={styles.actionSubTitle}>Allocate vehicle instantly</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color="#121417" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigation.navigate('ActiveBookingsTab')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: THEME.colors.accentSoft }]}>
              <Ionicons name="log-out-outline" size={22} color={THEME.colors.accent} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionSecondaryTitle}>Exit / Checkout</Text>
              <Text style={styles.actionSubTitle}>{summary?.activeBookings || 0} active</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Live Active Parked Vehicles Stream */}
        {activeBookings.length > 0 && (
          <View style={styles.liveStreamSection}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleWithDot}>
                <View style={styles.pulsingGreenBeacon} />
                <Text style={styles.sectionHeader}>LIVE PARKING METERS</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ActiveBookingsTab')}>
                <Text style={styles.viewAllText}>View All ({summary?.activeBookings || 0}) →</Text>
              </TouchableOpacity>
            </View>

            {activeBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCheckout={(item) => navigation.navigate('Checkout', { bookingId: item.id })}
                onPress={(item) => navigation.navigate('Checkout', { bookingId: item.id })}
              />
            ))}
          </View>
        )}

        {/* Interactive Parking Lot Bays Matrix */}
        <View style={styles.baysSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeader}>PARKING BAYS SCHEMATIC</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SlotsTab')}>
              <Text style={styles.viewAllText}>Expand Full Bay ({slots.length}) →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bayGrid}>
            {slots.slice(0, 10).map((slot) => {
              const isAvail = slot.status === 'AVAILABLE';
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.baySlot,
                    isAvail ? styles.baySlotAvail : styles.baySlotOccupied,
                  ]}
                  onPress={() => {
                    if (isAvail) {
                      navigation.navigate('NewBooking', { preselectedSlotId: slot.id });
                    } else if (slot.currentBookingId) {
                      navigation.navigate('Checkout', { bookingId: slot.currentBookingId });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={slot.vehicleType === 'FOUR_WHEELER' ? 'car' : 'bicycle'}
                    size={14}
                    color={isAvail ? THEME.colors.available : THEME.colors.occupied}
                  />
                  <Text style={[styles.baySlotNum, isAvail ? styles.textGreen : styles.textRed]}>
                    {slot.slotNumber}
                  </Text>
                  <Text style={styles.baySlotStatus} numberOfLines={1}>
                    {isAvail ? 'FREE' : (slot.currentVehicleNumber || 'BUSY')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Tariff Transparent Banner */}
        <View style={styles.tariffCard}>
          <View style={styles.tariffIconWrap}>
            <Ionicons name="sparkles" size={20} color={THEME.colors.accent} />
          </View>
          <View style={styles.tariffTextWrap}>
            <Text style={styles.tariffTitle}>Automated Dynamic Tariff Engine</Text>
            <Text style={styles.tariffDesc}>
              ₹50 per 3 hours (or fraction thereof). Positive parking durations start at ₹50. Zero duration costs ₹0.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  occupancyBanner: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.medium,
  },
  occupancyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing.md,
  },
  bannerSubTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
  bannerMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  statusGlowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    borderWidth: 1,
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusGlowText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  trackContainer: {
    height: 8,
    backgroundColor: THEME.colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: THEME.spacing.md,
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  miniStatText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  boldWhite: {
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  metricCard: {
    width: '47.5%',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.md,
  },
  actionStationRow: {
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    gap: THEME.spacing.md,
  },
  shadowAccent: {
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderStrong,
    gap: THEME.spacing.md,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#121417',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#121417',
  },
  actionSecondaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  actionSubTitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  liveStreamSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  sectionTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingGreenBeacon: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: THEME.colors.available,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.accent,
  },
  baysSection: {
    marginBottom: THEME.spacing.xl,
  },
  bayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  baySlot: {
    width: '18.4%',
    aspectRatio: 0.95,
    padding: 4,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.surface,
  },
  baySlotAvail: {
    borderColor: THEME.colors.availableBorder,
    backgroundColor: THEME.colors.availableLight,
  },
  baySlotOccupied: {
    borderColor: THEME.colors.occupiedBorder,
    backgroundColor: THEME.colors.occupiedLight,
  },
  baySlotNum: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  baySlotStatus: {
    fontSize: 8,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  textGreen: {
    color: THEME.colors.available,
  },
  textRed: {
    color: THEME.colors.occupied,
  },
  tariffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.borderAccent,
    gap: THEME.spacing.md,
  },
  tariffIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tariffTextWrap: {
    flex: 1,
  },
  tariffTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.accent,
    marginBottom: 2,
  },
  tariffDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
});
