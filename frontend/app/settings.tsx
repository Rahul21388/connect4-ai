import React from 'react';
import {
View,
Text,
TouchableOpacity,
StyleSheet,
ScrollView,
Switch,
} from 'react-native';

import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

// ✅ FIXED SOUND TOGGLE
const handleToggleSound = async () => {
const newValue = !soundEnabled;

// Update global state first
toggleSound();

// Enable/Disable SoundService
SoundService.setEnabled(newValue);

if (newValue) {
  // ✅ Sound turned ON → restart background music + click
  await SoundService.playClick();
  await SoundService.startBackground();
} else {
  // ✅ Sound turned OFF → stop everything
  await SoundService.stopBackground();
}


};

// Theme toggle
const handleToggleTheme = async () => {
if (soundEnabled) {
await SoundService.playClick();
}
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
    {/* Appearance Section */}
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
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
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

    {/* Sound Section */}
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
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {soundEnabled ? 'Game sounds enabled' : 'Game sounds disabled'}
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

    {/* About Section */}
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        ABOUT
      </Text>

      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.aboutContent}>
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="grid" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.appName, { color: colors.text }]}>
            Connect 4
          </Text>

          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
         

          </Text>

          <Text style={[styles.appDescription, { color: colors.textSecondary }]}>
            Challenge the AI in this classic strategy game!
          </Text>
        </View>
      </View>
    </View>

    {/* How to Play */}
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        HOW TO PLAY
      </Text>

      <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.infoContent}>
          <View style={styles.infoItem}>
            <View style={[styles.discPreview, { backgroundColor: colors.playerDisc }]} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Your disc (Red)
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.discPreview, { backgroundColor: colors.aiDisc }]} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              AI disc (Yellow)
            </Text>
          </View>

          <Text style={[styles.rulesText, { color: colors.textSecondary }]}>
            Connect 4 of your discs in a row (horizontally, vertically, or diagonally) to win!
          </Text>
        </View>
      </View>
    </View>
  </ScrollView>
</SafeAreaView>


);
}

/* Styles */
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

headerTitle: {
fontSize: 20,
fontWeight: 'bold',
},

headerRight: {
width: 44,
},

scrollContent: {
padding: 20,
},

section: {
marginBottom: 24,
},

sectionTitle: {
fontSize: 12,
fontWeight: '600',
letterSpacing: 1,
marginBottom: 12,
marginLeft: 4,
},

settingCard: {
borderRadius: 16,
overflow: 'hidden',
},

settingRow: {
flexDirection: 'row',
alignItems: 'center',
padding: 16,
},

settingIcon: {
width: 48,
height: 48,
borderRadius: 12,
justifyContent: 'center',
alignItems: 'center',
marginRight: 16,
},

settingContent: {
flex: 1,
},

settingTitle: {
fontSize: 16,
fontWeight: '600',
marginBottom: 2,
},

settingDescription: {
fontSize: 14,
},

aboutContent: {
padding: 24,
alignItems: 'center',
},

logoContainer: {
width: 72,
height: 72,
borderRadius: 18,
justifyContent: 'center',
alignItems: 'center',
marginBottom: 16,
},

appName: {
fontSize: 24,
fontWeight: 'bold',
marginBottom: 4,
},

appVersion: {
fontSize: 14,
marginBottom: 12,
},

appDescription: {
fontSize: 14,
textAlign: 'center',
},

infoContent: {
padding: 20,
},

infoItem: {
flexDirection: 'row',
alignItems: 'center',
marginBottom: 12,
},

discPreview: {
width: 24,
height: 24,
borderRadius: 12,
marginRight: 12,
},

infoText: {
fontSize: 16,
},

rulesText: {
fontSize: 14,
lineHeight: 20,
marginTop: 8,
},
});