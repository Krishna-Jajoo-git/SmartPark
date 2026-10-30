import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingIndicator from '../components/LoadingIndicator';
import { analyticsApi } from '../api/analyticsApi';
import { formatCurrency, formatDateOnly } from '../utils/formatters';

export default function AnalyticsScreen({ navigation }) {
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [dateInput, setDateInput] = useState(getTodayISO());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  const loadAnalytics = useCallback(async (date) => {
    try {
      setLoading(true);
      const [rev, sum] = await Promise.all([
        analyticsApi.getRevenueByDate(date),
        analyticsApi.getSummary(),
      ]);
      setRevenueData(rev);
      setSummaryData(sum);
    } catch (err) {
      console.warn('Analytics sync issue:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics(selectedDate);
    const unsubscribe = navigation.addListener('focus', () => {
      loadAnalytics(selectedDate);
    });
    return unsubscribe;
  }, [navigation, selectedDate, loadAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics(selectedDate);
  };

  const handleApplyCustomDate = () => {
    const trimmed = dateInput.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      Alert.alert('Invalid Date Format', 'Please enter date formatted as YYYY-MM-DD');
      return;
    }
    setSelectedDate(trimmed);
  };

  const setPresetDate = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const iso = d.toISOString().split('T')[0];
    setDateInput(iso);
    setSelectedDate(iso);
  };

  if (loading && !revenueData) {
    return <LoadingIndicator message="Aggregating Financial Metrics..." />;
  }

  // Breakdown by payment method calculation
  const breakdown = revenueData?.breakdownByPaymentMethod || {};
  const totalRev = revenueData?.totalRevenue || 0;

  return (
    <View style={styles.container}>
      <Header
        title="Revenue & Analytics"
        subtitle="Financial Auditing & Turnover Intelligence"
        badgeText="PostgreSQL"
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
        {/* Date Filter Console */}
        <View style={styles.filterConsoleCard}>
          <Text style={styles.consoleTitle}>SETTLEMENT CALENDAR FILTER</Text>

          {/* Quick Preset Buttons */}
          <View style={styles.presetsRow}>
            {[
              { label: 'Today', days: 0 },
              { label: 'Yesterday', days: 1 },
              { label: '2 Days Ago', days: 2 },
            ].map((p) => {
              const d = new Date();
              d.setDate(d.getDate() - p.days);
              const iso = d.toISOString().split('T')[0];
              const isSelected = selectedDate === iso;
              return (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                  onPress={() => setPresetDate(p.days)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetBtnText, isSelected && styles.presetBtnTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Date Input Field */}
          <View style={styles.customDateRow}>
            <TextInput
              style={styles.dateInput}
              value={dateInput}
              onChangeText={setDateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={THEME.colors.textMuted}
              maxLength={10}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCustomDate} activeOpacity={0.8}>
              <Text style={styles.applyBtnText}>Filter Date</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Date Revenue Spotlight */}
        <View style={styles.revenueSpotlightCard}>
          <View style={styles.spotlightHeader}>
            <View>
              <Text style={styles.spotlightLabel}>SETTLED AUDITED REVENUE</Text>
              <Text style={styles.spotlightDate}>{formatDateOnly(revenueData?.date || selectedDate)}</Text>
            </View>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyBadgeText}>INR (₹)</Text>
            </View>
          </View>

          <Text style={styles.revenueHero}>{formatCurrency(revenueData?.totalRevenue || 0)}</Text>

          <View style={styles.spotlightFooter}>
            <Ionicons name="receipt-outline" size={15} color={THEME.colors.accent} />
            <Text style={styles.spotlightFooterText}>
              {revenueData?.bookingCount || 0} completed & verified sessions
            </Text>
          </View>
        </View>

        {/* Payment Methods Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardSectionHeader}>PAYMENT METHOD DIVERSIFICATION</Text>
          {Object.keys(breakdown).length > 0 ? (
            Object.entries(breakdown).map(([method, amount]) => {
              const percent = totalRev > 0 ? Math.round((amount / totalRev) * 100) : 0;
              let icon = 'wallet-outline';
              let color = THEME.colors.accent;
              if (method === 'UPI') { icon = 'qr-code-outline'; color = '#E5B869'; }
              if (method === 'CARD') { icon = 'card-outline'; color = '#F5D38E'; }
              if (method === 'CASH') { icon = 'cash-outline'; color = '#34D399'; }
              if (method === 'NET_BANKING') { icon = 'globe-outline'; color = '#C99A46'; }

              return (
                <View key={method} style={styles.breakdownItem}>
                  <View style={styles.breakdownTopRow}>
                    <View style={styles.methodInfo}>
                      <Ionicons name={icon} size={16} color={color} />
                      <Text style={styles.methodName}>{method}</Text>
                    </View>
                    <Text style={styles.methodAmount}>{formatCurrency(amount)} ({percent}%)</Text>
                  </View>
                  <View style={styles.breakdownTrack}>
                    <View style={[styles.breakdownFill, { width: `${percent}%`, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noBreakdownText}>
              No settled transactions recorded on {selectedDate}.
            </Text>
          )}
        </View>

        {/* Lifetime Facility Statistics Grid */}
        <Text style={styles.sectionHeader}>ALL-TIME FACILITY TELEMETRY</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Bookings"
            value={summaryData?.totalBookings ?? 0}
            icon="car-sport"
            iconColor={THEME.colors.accent}
            subtitle="Lifetime traffic"
            style={styles.halfCard}
          />
          <StatCard
            title="Completed"
            value={summaryData?.completedBookings ?? 0}
            icon="checkmark-done-circle"
            iconColor={THEME.colors.available}
            subtitle="Settled & released"
            style={styles.halfCard}
          />
          <StatCard
            title="Active Now"
            value={summaryData?.activeBookings ?? 0}
            icon="timer"
            iconColor={THEME.colors.pending}
            subtitle="Current meters"
            style={styles.halfCard}
          />
          <StatCard
            title="Utilization"
            value={`${summaryData?.occupancyRatePercentage ?? 0}%`}
            icon="pie-chart"
            iconColor={THEME.colors.neonViolet}
            subtitle="Capacity usage"
            style={styles.halfCard}
          />
        </View>

        {/* Cumulative Revenue Record */}
        <View style={styles.cumulativeCard}>
          <View style={styles.cumulativeHeader}>
            <Text style={styles.cumulativeTitle}>ALL-TIME SYSTEM REVENUE</Text>
            <Ionicons name="sparkles" size={18} color={THEME.colors.available} />
          </View>
          <Text style={styles.allTimeRevenue}>{formatCurrency(summaryData?.totalRevenue || 0)}</Text>
          <Text style={styles.cumulativeSubtitle}>
            Aggregated across all verified PAID payment records in PostgreSQL
          </Text>
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
  filterConsoleCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  consoleTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: THEME.spacing.sm,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.surfaceSubtle,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  presetBtnActive: {
    backgroundColor: THEME.colors.accentDeep,
    borderColor: THEME.colors.accent,
  },
  presetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  presetBtnTextActive: {
    color: THEME.colors.textLight,
  },
  customDateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 16,
    borderRadius: THEME.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#121417',
  },
  revenueSpotlightCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xl,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.availableBorder,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.medium,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  spotlightLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
  spotlightDate: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
  currencyBadge: {
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  currencyBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.accent,
  },
  revenueHero: {
    fontSize: 34,
    fontWeight: '900',
    color: THEME.colors.available,
    marginVertical: THEME.spacing.sm,
    letterSpacing: -0.5,
  },
  spotlightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: THEME.spacing.sm,
  },
  spotlightFooterText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.lg,
  },
  cardSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.md,
  },
  breakdownItem: {
    marginBottom: 12,
  },
  breakdownTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  methodName: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  methodAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  breakdownTrack: {
    height: 6,
    backgroundColor: THEME.colors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },
  noBreakdownText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontStyle: 'italic',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
    marginBottom: THEME.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.lg,
  },
  halfCard: {
    width: '47.5%',
  },
  cumulativeCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: THEME.spacing.md,
  },
  cumulativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cumulativeTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: THEME.colors.textMuted,
  },
  allTimeRevenue: {
    fontSize: 26,
    fontWeight: '900',
    color: THEME.colors.available,
    marginVertical: 4,
  },
  cumulativeSubtitle: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
});
