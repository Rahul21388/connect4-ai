import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { Column } from './Column';
import { BoardState, ROWS, COLS } from '../ai/gameUtils';

interface BoardProps {
  board: BoardState;
  onColumnPress: (column: number) => void;
  disabled: boolean;
  winningCells: [number, number][] | null;
  lastMove: { row: number; col: number } | null;
}

const { width: screenWidth } = Dimensions.get('window');
const BOARD_PADDING = 16;
const BOARD_WIDTH = Math.min(screenWidth - 40, 400);
const CELL_SIZE = (BOARD_WIDTH - BOARD_PADDING * 2) / COLS;

export const Board: React.FC<BoardProps> = ({
  board,
  onColumnPress,
  disabled,
  winningCells,
  lastMove,
}) => {
  const dropAnimation = useSharedValue(0);

  useEffect(() => {
    if (lastMove) {
      dropAnimation.value = 0;
      dropAnimation.value = withSpring(1, {
        damping: 8,
        stiffness: 100,
      });
    }
  }, [lastMove]);

  // Transform board to column-based for rendering
  const getColumnData = (colIndex: number): number[] => {
    return board.map((row) => row[colIndex]);
  };

  return (
    <View style={styles.boardContainer}>
      <View style={[styles.board, { width: BOARD_WIDTH }]}>
        <View style={styles.columnsContainer}>
          {Array.from({ length: COLS }).map((_, colIndex) => (
            <Column
              key={colIndex}
              columnData={getColumnData(colIndex)}
              columnIndex={colIndex}
              onPress={onColumnPress}
              disabled={disabled}
              winningCells={winningCells}
              cellSize={CELL_SIZE}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    backgroundColor: '#1E40AF',
    borderRadius: 16,
    padding: BOARD_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  columnsContainer: {
    flexDirection: 'row',
  },
});
