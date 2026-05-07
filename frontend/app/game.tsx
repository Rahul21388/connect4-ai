import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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

type MoveRecord = { col: number; player: 1 | 2; row: number };

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

  const [gameOver, setGameOver] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [statsUpdated, setStatsUpdated] = useState(false);

  // Move history for replay
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [replayBoard, setReplayBoard] = useState<BoardState>(createEmptyBoard());
  const [replayLastMove, setReplayLastMove] =
    useState<{ row: number; col: number } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Enable / Disable sound
  useEffect(() => {
    SoundService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // AI Move Logic
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

  // AI Turn
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
          setMoveHistory((prev) => [
            ...prev,
            { col: aiCol, player: 2, row: dropRow },
          ]);

          // AI Win
          if (checkWin(newBoard, 2)) {
            setWinningCells(getWinningCells(newBoard, 2));
            setGameState("aiWin");

            if (soundEnabled) await SoundService.playLose();

            setGameOver(true);
          }

          // Draw
          else if (isBoardFull(newBoard)) {
            setGameState("draw");

            if (soundEnabled) await SoundService.playDraw();

            setGameOver(true);
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

  // Update Stats Once
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

  // Player Move
  const handleColumnPress = async (col: number) => {
    if (!isPlayerTurn || gameState !== "playing" || isAIThinking) return;

    const validMoves = getValidMoves(board);
    if (!validMoves.includes(col)) return;

    const dropRow = getDropRow(board, col);
    const newBoard = makeMove(board, col, 1);

    if (soundEnabled) await SoundService.playDrop();

    setBoard(newBoard);
    setLastMove({ row: dropRow, col });
    setMoveHistory((prev) => [...prev, { col, player: 1, row: dropRow }]);

    // Player Win
    if (checkWin(newBoard, 1)) {
      setWinningCells(getWinningCells(newBoard, 1));
      setGameState("playerWin");

      if (soundEnabled) await SoundService.playWin();

      setGameOver(true);
    }

    // Draw
    else if (isBoardFull(newBoard)) {
      setGameState("draw");

      if (soundEnabled) await SoundService.playDraw();

      setGameOver(true);
    }

    // AI Turn
    else {
      setIsPlayerTurn(false);
    }
  };

  // Reset Game
  const handlePlayAgain = async () => {
    if (soundEnabled) await SoundService.playClick();

    setBoard(createEmptyBoard());
    setIsPlayerTurn(true);
    setGameState("playing");
    setWinningCells(null);
    setLastMove(null);
    setGameOver(false);
    setStatsUpdated(false);
    setMoveHistory([]);
    setIsReplaying(false);
    setReplayStep(0);
    setReplayBoard(createEmptyBoard());
    setReplayLastMove(null);
    setIsAutoPlaying(false);
  };

  // Replay: jump to a specific move index
  const goToStep = useCallback(
    (step: number) => {
      const newBoard = moveHistory
        .slice(0, step)
        .reduce(
          (b, { col, player }) => makeMove(b, col, player),
          createEmptyBoard()
        );

      setReplayBoard(newBoard);
      setReplayStep(step);
      setReplayLastMove(
        step > 0
          ? { row: moveHistory[step - 1].row, col: moveHistory[step - 1].col }
          : null
      );
    },
    [moveHistory]
  );

  const startReplay = async () => {
    if (soundEnabled) await SoundService.playClick();
    setIsReplaying(true);
    setIsAutoPlaying(false);
    // Start from the final state so player sees the board first, then can step back/forward
    const totalMoves = moveHistory.length;
    const finalBoard = moveHistory.reduce(
      (b, { col, player }) => makeMove(b, col, player),
      createEmptyBoard()
    );
    setReplayBoard(finalBoard);
    setReplayStep(totalMoves);
    setReplayLastMove(
      totalMoves > 0
        ? { row: moveHistory[totalMoves - 1].row, col: moveHistory[totalMoves - 1].col }
        : null
    );
  };

  const exitReplay = () => {
    setIsReplaying(false);
    setIsAutoPlaying(false);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !isReplaying) return;

    if (replayStep >= moveHistory.length) {
      setIsAutoPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      goToStep(replayStep + 1);
    }, 700);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, isReplaying, replayStep, moveHistory, goToStep]);

  // Result message config
  const getResultMessage = () => {
    switch (gameState) {
      case "playerWin":
        return { title: "You Win!", icon: "trophy", color: colors.success };
      case "aiWin":
        return { title: "AI Wins", icon: "sad", color: colors.error };
      case "draw":
        return { title: "It's a Draw!", icon: "remove", color: colors.warning };
      default:
        return { title: "", icon: "help", color: colors.text };
    }
  };

  const result = getResultMessage();

  // What the board displays depends on whether we're replaying
  const displayBoard = isReplaying ? replayBoard : board;
  const displayLastMove = isReplaying ? replayLastMove : lastMove;
  const displayWinningCells =
    isReplaying && replayStep < moveHistory.length ? null : winningCells;

  const replayPlayerLabel =
    replayStep > 0
      ? moveHistory[replayStep - 1].player === 1
        ? "You"
        : "AI"
      : null;

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

      {/* Turn / Replay Indicator */}
      <View style={styles.turnContainer}>
        {isReplaying ? (
          <>
            <Text style={[styles.replayStepLabel, { color: colors.primary }]}>
              Move {replayStep} / {moveHistory.length}
              {replayPlayerLabel ? `  ·  ${replayPlayerLabel}` : ""}
            </Text>
          </>
        ) : (
          <>
            {isAIThinking && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
            <Text style={{ color: colors.textSecondary, marginTop: 6 }}>
              {isAIThinking
                ? "AI is thinking..."
                : isPlayerTurn
                ? "Your Turn"
                : "AI Turn"}
            </Text>
          </>
        )}
      </View>

      {/* Board — always visible */}
      <Board
        board={displayBoard}
        onColumnPress={isReplaying ? () => {} : handleColumnPress}
        disabled={!isPlayerTurn || isAIThinking || isReplaying || gameOver}
        winningCells={displayWinningCells}
        lastMove={displayLastMove}
      />

      {/* Result Card — shown below the board when the game ends */}
      {gameOver && !isReplaying && (
        <View
          style={[styles.resultCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.resultHeader}>
            <Ionicons
              name={result.icon as any}
              size={36}
              color={result.color}
            />
            <Text style={[styles.resultTitle, { color: result.color }]}>
              {result.title}
            </Text>
          </View>

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={[styles.replayButton, { borderColor: colors.primary }]}
              onPress={startReplay}
            >
              <Ionicons name="play-back" size={16} color={colors.primary} />
              <Text style={[styles.replayButtonText, { color: colors.primary }]}>
                Watch Replay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playAgainButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handlePlayAgain}
            >
              <Text style={styles.playAgainText}>Play Again</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.replace("/menu")}>
            <Text
              style={[styles.backToMenuText, { color: colors.textSecondary }]}
            >
              Back to Menu
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Replay Controls — shown below the board while replaying */}
      {isReplaying && (
        <View
          style={[styles.replayControls, { backgroundColor: colors.surface }]}
        >
          <View style={styles.replayButtonRow}>
            <TouchableOpacity
              style={styles.replayNavButton}
              onPress={() => {
                setIsAutoPlaying(false);
                goToStep(0);
              }}
              disabled={replayStep === 0}
            >
              <Ionicons
                name="play-skip-back"
                size={26}
                color={replayStep === 0 ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replayNavButton}
              onPress={() => {
                setIsAutoPlaying(false);
                goToStep(Math.max(0, replayStep - 1));
              }}
              disabled={replayStep === 0}
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={replayStep === 0 ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.replayPlayButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => {
                // If at end, restart from beginning
                if (replayStep >= moveHistory.length && !isAutoPlaying) {
                  goToStep(0);
                  setIsAutoPlaying(true);
                } else {
                  setIsAutoPlaying(!isAutoPlaying);
                }
              }}
            >
              <Ionicons
                name={isAutoPlaying ? "pause" : "play"}
                size={26}
                color="#FFF"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replayNavButton}
              onPress={() => {
                setIsAutoPlaying(false);
                goToStep(Math.min(moveHistory.length, replayStep + 1));
              }}
              disabled={replayStep === moveHistory.length}
            >
              <Ionicons
                name="chevron-forward"
                size={26}
                color={
                  replayStep === moveHistory.length
                    ? colors.textSecondary
                    : colors.primary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.replayNavButton}
              onPress={() => {
                setIsAutoPlaying(false);
                goToStep(moveHistory.length);
              }}
              disabled={replayStep === moveHistory.length}
            >
              <Ionicons
                name="play-skip-forward"
                size={26}
                color={
                  replayStep === moveHistory.length
                    ? colors.textSecondary
                    : colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.exitReplayButton, { borderColor: colors.primary }]}
            onPress={exitReplay}
          >
            <Text
              style={[styles.exitReplayText, { color: colors.primary }]}
            >
              Exit Replay
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    minHeight: 32,
    justifyContent: "center",
  },

  replayStepLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Result card (replaces the full-screen modal)
  resultCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  resultButtons: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 12,
  },

  replayButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },

  replayButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  playAgainButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },

  playAgainText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },

  backToMenuText: {
    fontSize: 13,
  },

  // Replay controls
  replayControls: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  replayButtonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  replayNavButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  replayPlayButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },

  exitReplayButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },

  exitReplayText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
