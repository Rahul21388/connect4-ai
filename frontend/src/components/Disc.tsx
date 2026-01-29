import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface DiscProps {
  player: number; // 0 = empty, 1 = player, 2 = AI
  isWinning?: boolean;
  size: number;
}

export const Disc: React.FC<DiscProps> = ({ player, isWinning = false, size }) => {
  const getDiscColor = () => {
    switch (player) {
      case 1:
        return '#EF4444'; // Red for player
      case 2:
        return '#FBBF24'; // Yellow for AI
      default:
        return 'transparent';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isWinning ? 1.1 : 1, {
            damping: 10,
            stiffness: 100,
          }),
        },
      ],
      borderWidth: isWinning ? 3 : 0,
      borderColor: '#FFFFFF',
    };
  });

  if (player === 0) {
    return (
      <View
        style={[
          styles.emptySlot,
          {
            width: size - 8,
            height: size - 8,
            borderRadius: (size - 8) / 2,
          },
        ]}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.disc,
        {
          width: size - 8,
          height: size - 8,
          borderRadius: (size - 8) / 2,
          backgroundColor: getDiscColor(),
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.discHighlight, { borderRadius: (size - 8) / 2 }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  emptySlot: {
    backgroundColor: '#1E3A5F',
  },
  disc: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  discHighlight: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '30%',
    height: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
