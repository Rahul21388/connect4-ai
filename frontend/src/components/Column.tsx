import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { Disc } from './Disc';

interface ColumnProps {
  columnData: number[];
  columnIndex: number;
  onPress: (column: number) => void;
  disabled: boolean;
  winningCells: [number, number][] | null;
  cellSize: number;
}

export const Column: React.FC<ColumnProps> = ({
  columnData,
  columnIndex,
  onPress,
  disabled,
  winningCells,
  cellSize,
}) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    if (!disabled) {
      scale.value = withSequence(
        withTiming(0.95, { duration: 50 }),
        withTiming(1, { duration: 50 })
      );
      onPress(columnIndex);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isWinningCell = (row: number): boolean => {
    if (!winningCells) return false;
    return winningCells.some(
      ([winRow, winCol]) => winRow === row && winCol === columnIndex
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.column, animatedStyle]}>
        {columnData.map((cell, rowIndex) => (
          <View
            key={rowIndex}
            style={[
              styles.cell,
              {
                width: cellSize,
                height: cellSize,
              },
            ]}
          >
            <Disc
              player={cell}
              isWinning={isWinningCell(rowIndex)}
              size={cellSize}
            />
          </View>
        ))}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
});
