import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../src/context/UserContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AdRemovalProvider } from './context/AdRemovalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import mobileAds from 'react-native-google-mobile-ads';

function RootLayoutNav() {
  const { isDarkMode, colors } = useTheme();
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="game" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="leaderboard" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('Google Mobile Ads initialised');
      })
      .catch(error => {
        console.error('Mobile Ads initialisation error:', error);
      });
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <UserProvider>
          <AdRemovalProvider>
            <RootLayoutNav />
          </AdRemovalProvider>
        </UserProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});