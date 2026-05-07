import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getLeaderboard, UserData } from '../src/firebase/firestore';
import { useUser } from '../src/context/UserContext';
import { useTheme } from '../src/context/ThemeContext';

// ── Theme tokens ────────────────────────────────────────────────────────────
const getTheme = (scheme: 'light' | 'dark') => ({
  bg:          scheme === 'dark' ? '#0F172A' : '#F1F5F9',
  card:        scheme === 'dark' ? '#1E293B' : '#FFFFFF',
  cardBorder:  '#3B82F6',
  rankDefault: scheme === 'dark' ? '#1E293B' : '#E2E8F0',
  text:        scheme === 'dark' ? '#FFFFFF' : '#0F172A',
  textMuted:   scheme === 'dark' ? '#94A3B8' : '#64748B',
  textSubtle:  scheme === 'dark' ? '#64748B' : '#94A3B8',
  winsBox:     scheme === 'dark' ? '#0F172A' : '#F1F5F9',
  accent:      '#3B82F6',
  wins:        '#22C55E',
});

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode ? 'dark' : 'light');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const data = await getLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const formatUsername = (name: string) =>
    name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0: return { backgroundColor: '#FFD700', icon: 'trophy' as const };
      case 1: return { backgroundColor: '#C0C0C0', icon: 'medal' as const };
      case 2: return { backgroundColor: '#CD7F32', icon: 'medal' as const };
      default: return { backgroundColor: theme.rankDefault, icon: null };
    }
  };

  const isCurrentUser = (username: string) =>
    user?.username?.toLowerCase() === username.toLowerCase();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.textSubtle }]}>
            Loading leaderboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Trophy Banner */}
      <View style={[styles.banner, { backgroundColor: theme.card }]}>
        <Ionicons name="trophy" size={48} color="#FFD700" />
        <Text style={[styles.bannerTitle, { color: theme.text }]}>Top Players</Text>
        <Text style={[styles.bannerSubtitle, { color: theme.textMuted }]}>
          Compete to reach the top!
        </Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.accent}
          />
        }
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color={theme.rankDefault} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No players yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSubtle }]}>
              Be the first to play!
            </Text>
          </View>
        ) : (
          leaderboard.map((player, index) => {
            const rankStyle = getRankStyle(index);
            const isCurrent = isCurrentUser(player.username);

            return (
              <View
                key={player.username}
                style={[
                  styles.playerCard,
                  { backgroundColor: theme.card },
                  isCurrent && { borderWidth: 2, borderColor: theme.cardBorder },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: rankStyle.backgroundColor }]}>
                  {rankStyle.icon ? (
                    <Ionicons name={rankStyle.icon} size={20} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.playerInfo}>
                  <View style={styles.playerNameContainer}>
                    <Text
                      style={[
                        styles.playerName,
                        { color: isCurrent ? theme.accent : theme.text },
                      ]}
                    >
                      {formatUsername(player.username)}
                    </Text>
                    {isCurrent && (
                      <View style={[styles.youBadge, { backgroundColor: theme.accent }]}>
                        <Text style={styles.youBadgeText}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.playerStats, { color: theme.textSubtle }]}>
                    {player.totalGames} games played
                  </Text>
                </View>

                <View style={[styles.winsContainer, { backgroundColor: theme.winsBox }]}>
                  <Text style={[styles.winsCount, { color: theme.wins }]}>{player.wins}</Text>
                  <Text style={[styles.winsLabel, { color: theme.textSubtle }]}>wins</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
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
  banner: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playerInfo: {
    flex: 1,
  },
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  playerStats: {
    fontSize: 14,
    marginTop: 2,
  },
  winsContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  winsCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  winsLabel: {
    fontSize: 12,
  },
});
