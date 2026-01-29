/**
 * Hard AI - Uses Minimax algorithm with Alpha-Beta pruning
 * Depth limited to 5 for mobile performance
 */

import { BoardState, getValidMoves, checkWin, makeMove, isBoardFull, ROWS, COLS } from './gameUtils';

const MAX_DEPTH = 5;
const AI_PLAYER = 2;
const HUMAN_PLAYER = 1;

// Evaluate position score for heuristic
const evaluateWindow = (window: number[]): number => {
  let score = 0;
  const aiCount = window.filter(cell => cell === AI_PLAYER).length;
  const humanCount = window.filter(cell => cell === HUMAN_PLAYER).length;
  const emptyCount = window.filter(cell => cell === 0).length;
  
  if (aiCount === 4) {
    score += 100;
  } else if (aiCount === 3 && emptyCount === 1) {
    score += 5;
  } else if (aiCount === 2 && emptyCount === 2) {
    score += 2;
  }
  
  if (humanCount === 3 && emptyCount === 1) {
    score -= 4;
  }
  
  return score;
};

// Evaluate the entire board
const evaluateBoard = (board: BoardState): number => {
  let score = 0;
  
  // Center column preference
  const centerCol = board.map(row => row[3]);
  const centerCount = centerCol.filter(cell => cell === AI_PLAYER).length;
  score += centerCount * 3;
  
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]];
      score += evaluateWindow(window);
    }
  }
  
  // Vertical
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS; col++) {
      const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
      score += evaluateWindow(window);
    }
  }
  
  // Diagonal (positive slope)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
      score += evaluateWindow(window);
    }
  }
  
  // Diagonal (negative slope)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [board[row][col], board[row - 1][col + 1], board[row - 2][col + 2], board[row - 3][col + 3]];
      score += evaluateWindow(window);
    }
  }
  
  return score;
};

// Check if game is over
const isTerminal = (board: BoardState): boolean => {
  return checkWin(board, AI_PLAYER) || checkWin(board, HUMAN_PLAYER) || isBoardFull(board);
};

// Minimax with Alpha-Beta pruning
const minimax = (
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): [number | null, number] => {
  const validMoves = getValidMoves(board);
  const terminal = isTerminal(board);
  
  if (depth === 0 || terminal) {
    if (terminal) {
      if (checkWin(board, AI_PLAYER)) {
        return [null, 100000000];
      } else if (checkWin(board, HUMAN_PLAYER)) {
        return [null, -100000000];
      } else {
        return [null, 0]; // Draw
      }
    } else {
      return [null, evaluateBoard(board)];
    }
  }
  
  if (isMaximizing) {
    let value = -Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, AI_PLAYER);
      const [, newScore] = minimax(newBoard, depth - 1, alpha, beta, false);
      
      if (newScore > value) {
        value = newScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) {
        break;
      }
    }
    
    return [bestCol, value];
  } else {
    let value = Infinity;
    let bestCol = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, HUMAN_PLAYER);
      const [, newScore] = minimax(newBoard, depth - 1, alpha, beta, true);
      
      if (newScore < value) {
        value = newScore;
        bestCol = col;
      }
      beta = Math.min(beta, value);
      if (alpha >= beta) {
        break;
      }
    }
    
    return [bestCol, value];
  }
};

export const getHardMove = (board: BoardState): number => {
  const validMoves = getValidMoves(board);
  
  if (validMoves.length === 0) {
    return -1;
  }
  
  // First move - prefer center
  const totalPieces = board.flat().filter(cell => cell !== 0).length;
  if (totalPieces <= 1) {
    return 3; // Center column
  }
  
  const [bestCol] = minimax(board, MAX_DEPTH, -Infinity, Infinity, true);
  return bestCol ?? validMoves[0];
};
