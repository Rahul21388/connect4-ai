/**
 * Easy AI - Makes random valid moves
 */

import { BoardState, getValidMoves } from './gameUtils';

export const getEasyMove = (board: BoardState): number => {
  const validMoves = getValidMoves(board);
  
  if (validMoves.length === 0) {
    return -1; // No valid moves
  }
  
  // Pick a random valid column
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};
