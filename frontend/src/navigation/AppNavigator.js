import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';

import DashboardScreen from '../screens/DashboardScreen';
import SlotsScreen from '../screens/SlotsScreen';
import BookingScreen from '../screens/BookingScreen';
import ActiveBookingsScreen from '../screens/ActiveBookingsScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ReceiptScreen from '../screens/ReceiptScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.accent,
        tabBarInactiveTintColor: THEME.colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#161920',
          borderTopColor: 'rgba(229, 184, 105, 0.15)',
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          ...THEME.shadows.medium,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'SlotsTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ActiveBookingsTab') {
            iconName = focused ? 'car-sport' : 'car-sport-outline';
          } else if (route.name === 'AnalyticsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }

          return (
            <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
              <Ionicons name={iconName} size={20} color={focused ? THEME.colors.accent : THEME.colors.textMuted} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="SlotsTab"
        component={SlotsScreen}
        options={{ tabBarLabel: 'Bays' }}
      />
      <Tab.Screen
        name="ActiveBookingsTab"
        component={ActiveBookingsScreen}
        options={{ tabBarLabel: 'Meters' }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121417',
        },
        headerTintColor: THEME.colors.accent,
        headerTitleStyle: {
          fontWeight: '800',
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: '#121417',
        },
      }}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewBooking"
        component={BookingScreen}
        options={{
          title: 'Park New Vehicle',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'Vehicle Checkout',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{
          title: 'Parking Receipt',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabIconWrapActive: {
    backgroundColor: THEME.colors.accentSoft,
  },
});
