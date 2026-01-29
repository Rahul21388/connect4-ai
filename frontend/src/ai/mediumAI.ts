/**
 * Medium AI - Takes winning move if available, blocks player's winning move,
 * otherwise makes random move
 */

import { BoardState, getValidMoves, checkWin, makeMove, ROWS } from './gameUtils';

export const getMediumMove = (board: BoardState): number => {
  const validMoves = getValidMoves(board);
  
  if (validMoves.length === 0) {
    return -1;
  }
  
  // First, check if AI can win
  for (const col of validMoves) {
    const testBoard = makeMove(board, col, 2); // AI is player 2
    if (checkWin(testBoard, 2)) {
      return col; // Take the winning move
    }
  }
  
  // Second, check if player can win and block them
  for (const col of validMoves) {
    const testBoard = makeMove(board, col, 1); // Player is player 1
    if (checkWin(testBoard, 1)) {
      return col; // Block the player
    }
  }
  
  // Third, prefer center column if available
  if (validMoves.includes(3)) {
    return 3;
  }
  
  // Otherwise, pick a random valid column
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
};
