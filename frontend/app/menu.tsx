import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";

import SoundService from "../src/services/SoundService";

type Difficulty = "easy" | "medium" | "hard";

export default function MenuScreen() {
  const router = useRouter();

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>("medium");

  const { user, logout } = useUser();
  const { colors, soundEnabled } = useTheme();

  // ✅ Initialise Sound ONLY ONCE
  useEffect(() => {
    const setup = async () => {
      await SoundService.initialize();
      SoundService.setEnabled(soundEnabled);

      // ✅ Start Background Music Here
      await SoundService.startBackground();
    };

    setup();
  }, []);

  // ✅ Enable / Disable sound
  useEffect(() => {
    SoundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Capitalise Username
  const formattedName = user?.username
    ? user.username
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

  // Play Button
  const handlePlay = async () => {
    if (soundEnabled) await SoundService.playClick();

    // ✅ Stop menu music during game
    await SoundService.stopBackground();

    router.push(`/game?difficulty=${selectedDifficulty}`);
  };

  // Logout Button
  const handleLogout = async () => {
    if (soundEnabled) await SoundService.playClick();
    await logout();
    router.replace("/");
  };

  // Difficulty Select
  const handleDifficultySelect = async (key: Difficulty) => {
    if (soundEnabled) await SoundService.playClick();
    setSelectedDifficulty(key);
  };

  const difficultyOptions = [
    {
      key: "easy",
      label: "Easy",
      icon: "happy",
      color: colors.success,
      description: "Random moves",
    },
    {
      key: "medium",
      label: "Medium",
      icon: "fitness",
      color: colors.warning,
      description: "Blocks & attacks",
    },
    {
      key: "hard",
      label: "Hard",
      icon: "skull",
      color: colors.error,
      description: "Smart AI",
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoSmall, { backgroundColor: colors.surface }]}>
            <Ionicons name="grid" size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Connect 4
          </Text>

          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
            Welcome, {formattedName}!
          </Text>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Difficulty
          </Text>

          <View style={styles.difficultyContainer}>
            {difficultyOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.difficultyCard,
                  { backgroundColor: colors.surface },
                  selectedDifficulty === option.key && {
                    borderColor: option.color,
                    borderWidth: 2,
                  },
                ]}
                onPress={() =>
                  handleDifficultySelect(option.key as Difficulty)
                }
              >
                <View
                  style={[
                    styles.difficultyIcon,
                    { backgroundColor: option.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={option.color}
                  />
                </View>

                <Text style={[styles.difficultyLabel, { color: colors.text }]}>
                  {option.label}
                </Text>

                <Text
                  style={[
                    styles.difficultyDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Play */}
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: colors.primary }]}
          onPress={handlePlay}
        >
          <Ionicons name="play" size={28} color="#FFFFFF" />
          <Text style={styles.playButtonText}>Play vs AI</Text>
        </TouchableOpacity>

        {/* Menu Options */}
        <View style={styles.menuOptions}>
          {/* Profile */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/profile")}
          >
            <View
              style={[
                styles.menuCardIcon,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>

            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>
                Profile
              </Text>
              <Text
                style={[
                  styles.menuCardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                View your stats
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Leaderboard */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/leaderboard")}
          >
            <View
              style={[
                styles.menuCardIcon,
                { backgroundColor: colors.warning + "20" },
              ]}
            >
              <Ionicons name="trophy" size={24} color={colors.warning} />
            </View>

            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>
                Leaderboard
              </Text>
              <Text
                style={[
                  styles.menuCardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Top 10 players
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={[styles.menuCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push("/settings")}
          >
            <View
              style={[
                styles.menuCardIcon,
                { backgroundColor: colors.textSecondary + "20" },
              ]}
            >
              <Ionicons
                name="settings"
                size={24}
                color={colors.textSecondary}
              />
            </View>

            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>
                Settings
              </Text>
              <Text
                style={[
                  styles.menuCardSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Theme & sounds
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },

  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoSmall: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
  },

  welcomeText: {
    fontSize: 16,
    marginTop: 6,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },

  difficultyContainer: {
    flexDirection: "row",
    gap: 12,
  },

  difficultyCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  difficultyIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  difficultyLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  difficultyDescription: {
    fontSize: 12,
    textAlign: "center",
  },

  playButton: {
    flexDirection: "row",
    borderRadius: 16,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },

  playButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  menuOptions: {
    gap: 12,
    marginBottom: 24,
  },

  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
  },

  menuCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  menuCardContent: {
    flex: 1,
  },

  menuCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },

  menuCardSubtitle: {
    fontSize: 14,
  },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
