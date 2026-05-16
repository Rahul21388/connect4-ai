import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../src/context/UserContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { AdRemovalProvider } from '../src/context/AdRemovalContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Alert, StyleSheet } from 'react-native';
import * as Updates from 'expo-updates';

// Expo Go does not bundle native ad modules — detect it before any require
const isExpoGo = !!(globalThis as any).expo?.modules?.ExpoGo;

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
  const hasPromptedRef = useRef(false);

  // OTA update check — runs on launch and every 30 minutes while app is open.
  useEffect(() => {
    if (__DEV__ || isExpoGo) return;

    async function checkForUpdate() {
      if (hasPromptedRef.current) return;
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable) return;
        await Updates.fetchUpdateAsync();
        if (hasPromptedRef.current) return;
        hasPromptedRef.current = true;
        Alert.alert(
          'Update Ready',
          'A new version is available. Restart now to get the latest improvements.',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
          ]
        );
      } catch {
        // Silent — network issues should never interrupt gameplay
      }
    }

    const launch = setTimeout(checkForUpdate, 3000);
    const interval = setInterval(checkForUpdate, 30 * 60 * 1000);
    return () => {
      clearTimeout(launch);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isExpoGo) return;

    try {
      // Lazy require keeps the native module out of the module graph in Expo Go
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: mobileAds } = require('react-native-google-mobile-ads');
      mobileAds()
        .initialize()
        .then(() => {
          console.log('Google Mobile Ads initialised');
        })
        .catch((err: unknown) => {
          console.error('Mobile Ads initialisation error:', err);
        });
    } catch (e) {
      console.warn('Google Mobile Ads not available:', e);
    }
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
