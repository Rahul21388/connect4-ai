import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Linking,
  Alert,
  Platform,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

import { useTheme } from '../src/context/ThemeContext';
import SoundService from '../src/services/SoundService';

export default function SettingsScreen() {
  const router = useRouter();

  const {
    isDarkMode,
    colors,
    toggleTheme,
    soundEnabled,
    toggleSound,
  } = useTheme();

  const PRIVACY_URL =
    "https://rahulprakash.co.in/apps/connect4/privacy.php";

  const TERMS_URL =
    "https://rahulprakash.co.in/apps/connect4/terms.php";

  const SUPPORT_EMAIL = "admin@rahulprakash.co.in";

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        if (soundEnabled) await SoundService.playClick();
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open link.");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const handleReplayTutorial = async () => {
    if (soundEnabled) await SoundService.playClick();
    router.push('/tutorial');
  };

  const handleSendFeedback = async () => {
    if (soundEnabled) await SoundService.playClick();

    const subject = encodeURIComponent("Connect 4 AI - User Feedback");
    const body = encodeURIComponent(
`Hi Rahul,

I would like to share the following feedback:

------------------------------------

App Version: ${appVersion}
Platform: ${Platform.OS}

------------------------------------

`
    );

    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert("Error", "No email app found.");
      }
    } catch {
      Alert.alert("Error", "Unable to open email client.");
    }
  };

  const handleToggleSound = async () => {
    const newValue = !soundEnabled;
    toggleSound();
    SoundService.setEnabled(newValue);

    if (newValue) {
      await SoundService.playClick();
      await SoundService.startBackground();
    } else {
      await SoundService.stopBackground();
    }
  };

  const handleToggleTheme = async () => {
    if (soundEnabled) await SoundService.playClick();
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons
                  name={isDarkMode ? 'moon' : 'sunny'}
                  size={24}
                  color={colors.primary}
                />
              </View>

              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Dark Mode
                </Text>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={handleToggleTheme}
                trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Audio */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            AUDIO
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons
                  name={soundEnabled ? 'volume-high' : 'volume-mute'}
                  size={24}
                  color={colors.success}
                />
              </View>

              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Sound Effects
                </Text>
              </View>

              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: colors.surfaceLight, true: colors.success }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SUPPORT
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleReplayTutorial}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="school-outline" size={24} color={colors.primary} />
              </View>

              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Replay Tutorial
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.surfaceLight, marginHorizontal: 16 }} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleSendFeedback}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="mail-outline" size={24} color={colors.success} />
              </View>

              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Send Feedback
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            LEGAL
          </Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openLink(PRIVACY_URL)}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={{ height: 1, backgroundColor: colors.surfaceLight, marginHorizontal: 16 }} />

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => openLink(TERMS_URL)}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Terms of Service
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerRight: { width: 44 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingCard: { borderRadius: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600' },
});