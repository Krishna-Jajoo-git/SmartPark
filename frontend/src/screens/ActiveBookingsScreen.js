import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import BookingCard from '../components/BookingCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { bookingsApi } from '../api/bookingsApi';
import { formatCurrency } from '../utils/formatters';

export default function ActiveBookingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('NEWEST'); // 'NEWEST' | 'FARE' | 'SLOT'

  const loadActiveBookings = useCallback(async () => {
    try {
      const data = await bookingsApi.getActiveBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Sync active bookings:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActiveBookings();
    const unsubscribe = navigation.addListener('focus', () => {
      loadActiveBookings();
    });

    // Auto-sync active meters every 8 seconds
    const interval = setInterval(() => {
      loadActiveBookings();
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation, loadActiveBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadActiveBookings();
  };

  const handleCheckout = (booking) => {
    navigation.navigate('Checkout', { bookingId: booking.id });
  };

  const filteredBookings = bookings
    .filter((b) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.trim().toUpperCase();
      return (
        b.vehicleNumber.includes(query) ||
        b.slotNumber.toUpperCase().includes(query) ||
        String(b.id).includes(query)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.entryTime) - new Date(a.entryTime);
      if (sortBy === 'FARE') return (b.accruedFare || 0) - (a.accruedFare || 0);
      if (sortBy === 'SLOT') return a.slotNumber.localeCompare(b.slotNumber);
      return 0;
    });

  const totalAccruedFare = bookings.reduce((sum, b) => sum + (b.accruedFare || 0), 0);

  if (loading && bookings.length === 0) {
    return <LoadingIndicator message="Connecting to Live Parking Meters..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Live Parking"
        subtitle={`${bookings.length} Vehicles Parked • Real-Time Tariff`}
        badgeText="SYNCED"
        onRefresh={onRefresh}
      />

      {/* Real-Time Live Overview Bar */}
      <View style={styles.metricsSummaryBar}>
        <View style={styles.metricSummaryCol}>
          <Text style={styles.summaryLabel}>ACTIVE VEHICLES</Text>
          <Text style={styles.summaryValue}>{bookings.length}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricSummaryCol}>
          <Text style={styles.summaryLabel}>ESTIMATED LIVE ACCRUAL</Text>
          <Text style={[styles.summaryValue, { color: THEME.colors.available }]}>
            {formatCurrency(totalAccruedFare)}
          </Text>
        </View>
      </View>

      {/* Dynamic Search & Filter Bar */}
      <View style={styles.controlsSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by license plate or slot..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Chips */}
        <View style={styles.sortRow}>
          {[
            { label: 'Latest First', value: 'NEWEST', icon: 'time-outline' },
            { label: 'Highest Fare', value: 'FARE', icon: 'trending-up-outline' },
            { label: 'Slot Order', value: 'SLOT', icon: 'grid-outline' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.value}
              style={[styles.sortChip, sortBy === chip.value && styles.sortChipActive]}
              onPress={() => setSortBy(chip.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={chip.icon}
                size={13}
                color={sortBy === chip.value ? THEME.colors.accent : THEME.colors.textSecondary}
              />
              <Text style={[styles.sortChipText, sortBy === chip.value && styles.sortChipTextActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bookings List with Live Tickers */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.accent}
            colors={[THEME.colors.accent]}
          />
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCheckout={handleCheckout}
            onPress={handleCheckout}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="car-sport-outline"
            title={searchQuery ? 'No Results Found' : 'Parking Lot is Vacant'}
            description={
              searchQuery
                ? `No active booking matches "${searchQuery}".`
                : 'All 25 slots are currently free. Ready to welcome new vehicles.'
            }
            actionTitle={searchQuery ? 'Clear Search' : 'Park First Vehicle'}
            onAction={() => {
              if (searchQuery) setSearchQuery('');
              else navigation.navigate('NewBooking');
            }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  metricsSummaryBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  metricSummaryCol: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    color: THEME.colors.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: THEME.colors.borderStrong,
  },
  controlsSection: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.sm,
  },
  searchIcon: {
    marginRight: THEME.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sortChipActive: {
    backgroundColor: THEME.colors.accentSoft,
    borderColor: THEME.colors.borderAccent,
  },
  sortChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  sortChipTextActive: {
    color: THEME.colors.accent,
  },
  listContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxxl + 20,
  },
});
