import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';

const CharcoalSandTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#121417',
    card: '#1A1E26',
    text: '#F8FAFC',
    border: 'rgba(229, 184, 105, 0.12)',
    primary: '#E5B869',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={CharcoalSandTheme}>
        <StatusBar style="light" backgroundColor="#121417" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
