/**
 * Game Utilities for Connect 4
 * Core game logic shared across AI modules
 */

export const ROWS = 6;
export const COLS = 7;

// Board type: 0 = empty, 1 = player 1 (red), 2 = player 2 (yellow/AI)
export type BoardState = number[][];

/**
 * Create an empty board
 */
export const createEmptyBoard = (): BoardState => {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
};

/**
 * Get all valid columns where a disc can be dropped
 */
export const getValidMoves = (board: BoardState): number[] => {
  const validMoves: number[] = [];
  for (let col = 0; col < COLS; col++) {
    if (board[0][col] === 0) {
      validMoves.push(col);
    }
  }
  return validMoves;
};

/**
 * Make a move on the board (returns new board state)
 */
export const makeMove = (board: BoardState, col: number, player: number): BoardState => {
  const newBoard = board.map(row => [...row]);
  
  // Find the lowest empty row in this column
  for (let row = ROWS - 1; row >= 0; row--) {
    if (newBoard[row][col] === 0) {
      newBoard[row][col] = player;
      break;
    }
  }
  
  return newBoard;
};

/**
 * Get the row where a disc would land in a column
 */
export const getDropRow = (board: BoardState, col: number): number => {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1; // Column is full
};

/**
 * Check if a player has won
 */
export const checkWin = (board: BoardState, player: number): boolean => {
  // Horizontal check
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player
      ) {
        return true;
      }
    }
  }
  
  // Vertical check
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player
      ) {
        return true;
      }
    }
  }
  
  // Diagonal check (positive slope - bottom-left to top-right)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row - 1][col + 1] === player &&
        board[row - 2][col + 2] === player &&
        board[row - 3][col + 3] === player
      ) {
        return true;
      }
    }
  }
  
  // Diagonal check (negative slope - top-left to bottom-right)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player
      ) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Check if board is full (draw)
 */
export const isBoardFull = (board: BoardState): boolean => {
  return board[0].every(cell => cell !== 0);
};

/**
 * Get winning cells for highlighting
 */
export const getWinningCells = (board: BoardState, player: number): [number, number][] | null => {
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player
      ) {
        return [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]];
      }
    }
  }
  
  // Vertical
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player
      ) {
        return [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]];
      }
    }
  }
  
  // Diagonal (positive slope)
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row - 1][col + 1] === player &&
        board[row - 2][col + 2] === player &&
        board[row - 3][col + 3] === player
      ) {
        return [[row, col], [row - 1, col + 1], [row - 2, col + 2], [row - 3, col + 3]];
      }
    }
  }
  
  // Diagonal (negative slope)
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player
      ) {
        return [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]];
      }
    }
  }
  
  return null;
};
