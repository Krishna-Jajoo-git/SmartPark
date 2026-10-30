import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import SlotCard from '../components/SlotCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';
import { slotsApi } from '../api/slotsApi';

export default function SlotsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [slots, setSlots] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'OCCUPIED'
  const [vehicleFilter, setVehicleFilter] = useState('ALL'); // 'ALL' | 'FOUR_WHEELER' | 'TWO_WHEELER'
  const [floorFilter, setFloorFilter] = useState('ALL');

  const loadSlots = useCallback(async () => {
    try {
      const data = await slotsApi.getAllSlots();
      setSlots(data);
    } catch (err) {
      console.warn('Sync slots issue:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
    const unsubscribe = navigation.addListener('focus', () => {
      loadSlots();
    });

    const interval = setInterval(() => {
      loadSlots();
    }, 10000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [navigation, loadSlots]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSlots();
  };

  const handleSlotPress = (slot) => {
    if (slot.status === 'AVAILABLE') {
      Alert.alert(
        `Allocate Space: ${slot.slotNumber}`,
        `Type: ${slot.vehicleType === 'FOUR_WHEELER' ? '4-Wheeler Car' : '2-Wheeler Bike'}\nLocation: ${slot.floor || 'Floor 1'}\n\nWould you like to allocate a vehicle to this slot?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Allocate Now',
            onPress: () => navigation.navigate('NewBooking', { preselectedSlotId: slot.id }),
          },
        ]
      );
    } else {
      Alert.alert(
        `Occupied Bay: ${slot.slotNumber}`,
        `Parked Vehicle: ${slot.currentVehicleNumber || 'Busy'}\n\nProceed to checkout this vehicle?`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Proceed to Checkout',
            style: 'destructive',
            onPress: () => {
              if (slot.currentBookingId) {
                navigation.navigate('Checkout', { bookingId: slot.currentBookingId });
              }
            },
          },
        ]
      );
    }
  };

  const filteredSlots = slots.filter((slot) => {
    const matchesStatus =
      statusFilter === 'ALL' || slot.status === statusFilter;
    const matchesVehicle =
      vehicleFilter === 'ALL' || !slot.vehicleType || slot.vehicleType === vehicleFilter;
    const matchesFloor =
      floorFilter === 'ALL' || (slot.floor && slot.floor.includes(floorFilter));
    const matchesSearch =
      !searchQuery.trim() ||
      slot.slotNumber.toUpperCase().includes(searchQuery.trim().toUpperCase()) ||
      (slot.currentVehicleNumber &&
        slot.currentVehicleNumber.toUpperCase().includes(searchQuery.trim().toUpperCase()));

    return matchesStatus && matchesVehicle && matchesFloor && matchesSearch;
  });

  const availableCount = slots.filter((s) => s.status === 'AVAILABLE').length;
  const occupiedCount = slots.filter((s) => s.status === 'OCCUPIED').length;

  if (loading && slots.length === 0) {
    return <LoadingIndicator message="Mapping Parking Facility Bays..." />;
  }

  return (
    <View style={styles.container}>
      <Header
        title="Parking Bays"
        subtitle={`${availableCount} Available • ${occupiedCount} Occupied`}
        badgeText={`${slots.length} Total`}
        onRefresh={onRefresh}
      />

      {/* Search & Multi-Filter Control Console */}
      <View style={styles.consoleSection}>
        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bay # (e.g. F1-01) or license plate..."
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

        {/* Status Filter Buttons */}
        <View style={styles.statusRow}>
          {[
            { id: 'ALL', label: `All (${slots.length})` },
            { id: 'AVAILABLE', label: `🟢 Free (${availableCount})` },
            { id: 'OCCUPIED', label: `🔴 Busy (${occupiedCount})` },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.statusBtn,
                statusFilter === item.id && styles.statusBtnActive,
                item.id === 'AVAILABLE' && statusFilter === item.id && styles.statusBtnAvailActive,
                item.id === 'OCCUPIED' && statusFilter === item.id && styles.statusBtnOccActive,
              ]}
              onPress={() => setStatusFilter(item.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  statusFilter === item.id && styles.statusBtnTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Vehicle Category & Floor Pills */}
        <View style={styles.pillsScrollRow}>
          {/* Category Toggle */}
          <TouchableOpacity
            style={[styles.pill, vehicleFilter === 'FOUR_WHEELER' && styles.pillActive]}
            onPress={() => setVehicleFilter(vehicleFilter === 'FOUR_WHEELER' ? 'ALL' : 'FOUR_WHEELER')}
            activeOpacity={0.7}
          >
            <Ionicons name="car-outline" size={12} color={vehicleFilter === 'FOUR_WHEELER' ? THEME.colors.accent : THEME.colors.textSecondary} />
            <Text style={[styles.pillText, vehicleFilter === 'FOUR_WHEELER' && styles.pillTextActive]}>4-Wheeler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, vehicleFilter === 'TWO_WHEELER' && styles.pillActive]}
            onPress={() => setVehicleFilter(vehicleFilter === 'TWO_WHEELER' ? 'ALL' : 'TWO_WHEELER')}
            activeOpacity={0.7}
          >
            <Ionicons name="bicycle-outline" size={12} color={vehicleFilter === 'TWO_WHEELER' ? THEME.colors.accent : THEME.colors.textSecondary} />
            <Text style={[styles.pillText, vehicleFilter === 'TWO_WHEELER' && styles.pillTextActive]}>2-Wheeler</Text>
          </TouchableOpacity>

          {/* Floors */}
          {[
            { label: 'Ground North', value: 'North' },
            { label: 'Ground South', value: 'South' },
            { label: 'Basement', value: 'Basement' },
          ].map((fl) => (
            <TouchableOpacity
              key={fl.value}
              style={[styles.pill, floorFilter === fl.value && styles.pillActive]}
              onPress={() => setFloorFilter(floorFilter === fl.value ? 'ALL' : fl.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, floorFilter === fl.value && styles.pillTextActive]}>{fl.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Grid of Slots */}
      <FlatList
        data={filteredSlots}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
          <View style={styles.slotWrapper}>
            <SlotCard slot={item} onPress={handleSlotPress} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="No Matching Bays"
            description="Adjust your search criteria or filter options to view available bays."
            actionTitle="Reset All Filters"
            onAction={() => {
              setSearchQuery('');
              setStatusFilter('ALL');
              setVehicleFilter('ALL');
              setFloorFilter('ALL');
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
  consoleSection: {
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
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.sm,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  statusBtnActive: {
    backgroundColor: THEME.colors.accentDeep,
    borderColor: THEME.colors.accent,
  },
  statusBtnAvailActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: THEME.colors.available,
  },
  statusBtnOccActive: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderColor: THEME.colors.occupied,
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  statusBtnTextActive: {
    color: THEME.colors.textPrimary,
  },
  pillsScrollRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  pillActive: {
    backgroundColor: THEME.colors.accentSoft,
    borderColor: THEME.colors.borderAccent,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  pillTextActive: {
    color: THEME.colors.accent,
    fontWeight: '700',
  },
  listContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxxl + 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  slotWrapper: {
    width: '48.5%',
  },
});
