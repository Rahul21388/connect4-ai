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

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // ✅ Capitalise Each Word in Username
  const formatUsername = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return { backgroundColor: '#FFD700', icon: 'trophy' as const };
      case 1:
        return { backgroundColor: '#C0C0C0', icon: 'medal' as const };
      case 2:
        return { backgroundColor: '#CD7F32', icon: 'medal' as const };
      default:
        return { backgroundColor: '#1E293B', icon: null };
    }
  };

  // ✅ Fix Current User Highlight (case-insensitive match)
  const isCurrentUser = (username: string) =>
    user?.username?.toLowerCase() === username.toLowerCase();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Trophy Banner */}
      <View style={styles.banner}>
        <Ionicons name="trophy" size={48} color="#FFD700" />
        <Text style={styles.bannerTitle}>Top Players</Text>
        <Text style={styles.bannerSubtitle}>Compete to reach the top!</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#334155" />
            <Text style={styles.emptyTitle}>No players yet</Text>
            <Text style={styles.emptySubtitle}>Be the first to play!</Text>
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
                  isCurrent && styles.currentPlayerCard,
                ]}
              >
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: rankStyle.backgroundColor },
                  ]}
                >
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
                        isCurrent && styles.currentPlayerName,
                      ]}
                    >
                      {/* ✅ Capital Username Display */}
                      {formatUsername(player.username)}
                    </Text>

                    {isCurrent && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>You</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.playerStats}>
                    {player.totalGames} games played
                  </Text>
                </View>

                <View style={styles.winsContainer}>
                  <Text style={styles.winsCount}>{player.wins}</Text>
                  <Text style={styles.winsLabel}>wins</Text>
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
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
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
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  banner: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
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
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  currentPlayerCard: {
    borderWidth: 2,
    borderColor: '#3B82F6',
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
    color: '#FFFFFF',
  },
  currentPlayerName: {
    color: '#3B82F6',
  },
  youBadge: {
    backgroundColor: '#3B82F6',
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
    color: '#64748B',
    marginTop: 2,
  },
  winsContainer: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  winsCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  winsLabel: {
    fontSize: 12,
    color: '#64748B',
  },
});
