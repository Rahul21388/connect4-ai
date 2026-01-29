/**
 * Firestore Helper Functions
 * Handles all database operations for Connect 4
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
  Firestore,
} from "firebase/firestore";

import { db, isFirebaseConfigured } from "./config";

/**
 * Capitalise Username Properly
 * Example: "rahul prakash" → "Rahul Prakash"
 */
const formatUsername = (name: string): string => {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};

export interface UserData {
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  lastPlayed: Timestamp | null;
}

export type GameResult = "win" | "loss" | "draw";

/**
 * Create a new user in Firestore
 */
export const createUser = async (username: string): Promise<UserData> => {
  const cleanUsername = formatUsername(username);

  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured - using mock data");
    return {
      username: cleanUsername,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      lastPlayed: null,
    };
  }

  const userData: UserData = {
    username: cleanUsername,
    wins: 0,
    losses: 0,
    draws: 0,
    totalGames: 0,
    lastPlayed: null,
  };

  try {
    /**
     * Store document using lowercase key
     * Prevents duplicates like Rahul vs rahul
     */
    const userId = cleanUsername.toLowerCase();

    const userRef = doc(db as Firestore, "users", userId);

    await setDoc(userRef, userData);

    return userData;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Get user data from Firestore
 * Returns null if user doesn't exist
 */
export const getUser = async (
  username: string
): Promise<UserData | null> => {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured - returning null");
    return null;
  }

  try {
    const userId = username.trim().toLowerCase();

    const userRef = doc(db as Firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }

    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
};

/**
 * Update user stats after a game
 */
export const updateStats = async (
  username: string,
  result: GameResult
): Promise<void> => {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured - stats not saved");
    return;
  }

  try {
    const userId = username.trim().toLowerCase();

    const userRef = doc(db as Firestore, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const currentData = userSnap.data() as UserData;

    const updates: Partial<UserData> = {
      totalGames: currentData.totalGames + 1,
    };

    switch (result) {
      case "win":
        updates.wins = currentData.wins + 1;
        break;
      case "loss":
        updates.losses = currentData.losses + 1;
        break;
      case "draw":
        updates.draws = currentData.draws + 1;
        break;
    }

    /**
     * Firestore Timestamp Fix:
     * serverTimestamp() is not a Timestamp directly,
     * so update separately.
     */
    await updateDoc(userRef, {
      ...updates,
      lastPlayed: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    throw error;
  }
};

/**
 * Get top 10 players sorted by wins
 */
export const getLeaderboard = async (): Promise<UserData[]> => {
  if (!isFirebaseConfigured()) {
    console.log("Firebase not configured - returning mock leaderboard");
    return [
      {
        username: "Player1",
        wins: 10,
        losses: 2,
        draws: 1,
        totalGames: 13,
        lastPlayed: null,
      },
      {
        username: "Player2",
        wins: 8,
        losses: 4,
        draws: 2,
        totalGames: 14,
        lastPlayed: null,
      },
      {
        username: "Player3",
        wins: 5,
        losses: 3,
        draws: 0,
        totalGames: 8,
        lastPlayed: null,
      },
    ];
  }

  try {
    const usersRef = collection(db as Firestore, "users");

    const q = query(usersRef, orderBy("wins", "desc"), limit(10));

    const querySnapshot = await getDocs(q);

    const leaderboard: UserData[] = [];

    querySnapshot.forEach((docSnap) => {
      leaderboard.push(docSnap.data() as UserData);
    });

    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    throw error;
  }
};
