import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Board } from "../src/components/Board";

import {
  BoardState,
  createEmptyBoard,
  makeMove,
  checkWin,
  isBoardFull,
  getValidMoves,
  getWinningCells,
  getDropRow,
} from "../src/ai/gameUtils";

import { getEasyMove } from "../src/ai/easyAI";
import { getMediumMove } from "../src/ai/mediumAI";
import { getHardMove } from "../src/ai/minimax";

import { useUser } from "../src/context/UserContext";
import { useTheme } from "../src/context/ThemeContext";

import { updateStats, GameResult } from "../src/firebase/firestore";

import SoundService from "../src/services/SoundService";

type Difficulty = "easy" | "medium" | "hard";
type GameState = "playing" | "playerWin" | "aiWin" | "draw";

export default function GameScreen() {
  const router = useRouter();

  const { difficulty = "medium" } =
    useLocalSearchParams<{ difficulty: Difficulty }>();

  const { user, refreshUser } = useUser();
  const { colors, soundEnabled } = useTheme();

  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState<GameState>("playing");

  const [winningCells, setWinningCells] =
    useState<[number, number][] | null>(null);

  const [lastMove, setLastMove] =
    useState<{ row: number; col: number } | null>(null);

  const [showResultModal, setShowResultModal] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  // ✅ Enable / Disable sound
  useEffect(() => {
    SoundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // ✅ AI Move Logic
  const getAIMove = useCallback(
    (currentBoard: BoardState): number => {
      switch (difficulty) {
        case "easy":
          return getEasyMove(currentBoard);
        case "hard":
          return getHardMove(currentBoard);
        default:
          return getMediumMove(currentBoard);
      }
    },
    [difficulty]
  );

  // ✅ AI Turn
  useEffect(() => {
    if (!isPlayerTurn && gameState === "playing") {
      setIsAIThinking(true);

      const timer = setTimeout(async () => {
        const aiCol = getAIMove(board);

        if (aiCol !== -1) {
          const newBoard = makeMove(board, aiCol, 2);
          const dropRow = getDropRow(board, aiCol);

          if (soundEnabled) await SoundService.playDrop();

          setBoard(newBoard);
          setLastMove({ row: dropRow, col: aiCol });

          // AI Win
          if (checkWin(newBoard, 2)) {
            setWinningCells(getWinningCells(newBoard, 2));
            setGameState("aiWin");

            if (soundEnabled) await SoundService.playLose();

            setShowResultModal(true);
          }

          // Draw
          else if (isBoardFull(newBoard)) {
            setGameState("draw");

            if (soundEnabled) await SoundService.playDraw();

            setShowResultModal(true);
          }

          // Continue game
          else {
            setIsPlayerTurn(true);
          }
        }

        setIsAIThinking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameState, board, getAIMove, soundEnabled]);

  // ✅ Update Stats Once
  useEffect(() => {
    const updateGameStats = async () => {
      if (gameState !== "playing" && user && !statsUpdated) {
        setStatsUpdated(true);

        let result: GameResult =
          gameState === "playerWin"
            ? "win"
            : gameState === "aiWin"
            ? "loss"
            : "draw";

        try {
          await updateStats(user.username, result);
          await refreshUser();
        } catch (err) {
          console.log("Stats update error:", err);
        }
      }
    };

    updateGameStats();
  }, [gameState, user, statsUpdated]);

  // ✅ Player Move
  const handleColumnPress = async (col: number) => {
    if (!isPlayerTurn || gameState !== "playing" || isAIThinking) return;

    const validMoves = getValidMoves(board);
    if (!validMoves.includes(col)) return;

    const dropRow = getDropRow(board, col);
    const newBoard = makeMove(board, col, 1);

    if (soundEnabled) await SoundService.playDrop();

    setBoard(newBoard);
    setLastMove({ row: dropRow, col });

    // Player Win
    if (checkWin(newBoard, 1)) {
      setWinningCells(getWinningCells(newBoard, 1));
      setGameState("playerWin");

      if (soundEnabled) await SoundService.playWin();

      setShowResultModal(true);
    }

    // Draw
    else if (isBoardFull(newBoard)) {
      setGameState("draw");

      if (soundEnabled) await SoundService.playDraw();

      setShowResultModal(true);
    }

    // AI Turn
    else {
      setIsPlayerTurn(false);
    }
  };

  // ✅ Reset Game
  const handlePlayAgain = async () => {
    if (soundEnabled) await SoundService.playClick();

    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameState("playing");
    setWinningCells(null);
    setLastMove(null);
    setShowResultModal(false);
    setStatsUpdated(false);
  };

  // ✅ Result Message
  const getResultMessage = () => {
    switch (gameState) {
      case "playerWin":
        return {
          title: "You Win!",
          icon: "trophy",
          color: colors.success,
        };

      case "aiWin":
        return {
          title: "AI Wins",
          icon: "sad",
          color: colors.error,
        };

      case "draw":
        return {
          title: "It's a Draw!",
          icon: "remove",
          color: colors.warning,
        };

      default:
        return { title: "", icon: "help", color: colors.text };
    }
  };

  const result = getResultMessage();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Connect 4
        </Text>

        <View style={{ width: 44 }} />
      </View>

      {/* Turn Indicator */}
      <View style={styles.turnContainer}>
        {isAIThinking && <ActivityIndicator size="small" color={colors.primary} />}
        <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
          {isAIThinking
            ? "AI is thinking..."
            : isPlayerTurn
            ? "Your Turn"
            : "AI Turn"}
        </Text>
      </View>

      {/* Board */}
      <Board
        board={board}
        onColumnPress={handleColumnPress}
        disabled={!isPlayerTurn || isAIThinking}
        winningCells={winningCells}
        lastMove={lastMove}
      />

      {/* Result Modal */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={result.icon as any}
              size={60}
              color={result.color}
            />

            <Text style={[styles.resultTitle, { color: result.color }]}>
              {result.title}
            </Text>

            <TouchableOpacity
              style={[
                styles.playAgainButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/menu")}>
              <Text style={{ marginTop: 12, color: colors.primary }}>
                Back to Menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  turnContainer: {
    alignItems: "center",
    marginBottom: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
  },

  resultTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
  },

  playAgainButton: {
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
  },

  playAgainText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
