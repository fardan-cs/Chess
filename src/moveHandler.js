// const jsBoardState = [
//   ['rb', 'nb', 'bb', 'qb', 'kb', 'bb', 'nb', 'rb'],
//   ['pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb'],
//   [null, null, null, null, null, null, null ,null],
//   [null, null, null, null, null, null, null ,null],
//   [null, null, null, null, null, null, null ,null],
//   [null, null, null, null, null, null, null ,null],
//   ['pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw'],
//   ['rw', 'nw', 'bw', 'qw', 'kw', 'bw', 'nw', 'rw'],
// ]

// const jsGameState = {
//   turn: 'w',
//   whiteKingSide: true,
//   whiteQueenSide: true,
//   blackKingSide: true,
//   blackQueenSide: true,
//   enPassantTarget: null,
// }

function isInsideBoard(row, col) {
  return row >= 0 && row < 8 &&
         col >= 0 && col < 8;
}

const rookMoves = [
  [-1, 0], 
  [1, 0], 
  [0, -1],
  [0, 1] 
]

const bishopMoves = [
  [-1, -1], 
  [1, -1], 
  [1, 1],
  [-1, 1] 
]

const queenMoves = [
  [-1, 0], 
  [1, 0], 
  [0, -1],
  [0, 1], 
  [-1, -1], 
  [1, -1], 
  [1, 1],
  [-1, 1] 
]

const knightMoves = [
  [-1, 2],
  [1, 2],
  [-2, 1],
  [2, 1],
  [1, -2],
  [-1, -2],
  [2, -1],
  [-2, -1],
]

const pawnBlackMoves= [
  [1, 0],
  [1, -1],
  [1, 1]
]
const pawnWhiteMoves = [
  [-1, 0],
  [-1, -1],
  [-1, 1]
]

export function getPiece(board, row, col) {
  return board[row][col];
}

function getPieceMoves(piece) {
    const movesMap= {
        r: rookMoves,
        b: bishopMoves,
        n: knightMoves,
        q: queenMoves,
        k: queenMoves 
    };

    const selected = movesMap[piece[0]] ?? null;
    const finalselected = piece[0] === 'p' && piece[1] === 'b' ? pawnBlackMoves : piece[0] === 'p' && piece[1] === 'w' ? pawnWhiteMoves : selected

    return finalselected;
}

export function getLegalMoves(board, row, col, gameState) {
  return getPseudoLegalMove(board, row, col, gameState).filter(move => {
    const boardTemp = structuredClone(board)
    const gameStateTemp = {...gameState}
    const boardNew = applyMove(boardTemp, `${row}-${col}`, move); 
    
    return !isInCheck(boardNew, gameStateTemp); 
  });
}

export function getPseudoLegalMove(board, row, col, gameState) {
  const piece = board[row][col];
  const moves = [];
  const directions = getPieceMoves(piece)

  if (piece[1] !== gameState.turn) {
    return moves
  }

  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;

    const sliding = ['r', 'b', 'q'].includes(piece[0]);

    if (sliding) {
      while (isInsideBoard(r, c)) {
        const target = board[r][c];

        if (!target || target[1] !== piece[1]) {
          moves.push(`${r}-${c}`);
        }

        if (target) break;
        r += dr;
        c += dc;
      }
    } else if (piece[0] === 'p') {
      if (row === 6 && piece[1] === 'w' || row === 1 && piece[1] === 'b') {
        for (let i = 0; i <= 1; i++) {
          const target = board[r][c];

          if ((dc === 0 && !target) || (dc !== 0 && (target && target[1] !== piece[1])) && r - dr === row || (`${r}-${c}` === gameState.enPassantTarget )) {
            moves.push(`${r}-${c}`);
          }

          if (target) break;
          r += dr;
          c += dc;
        }          
      } else if (isInsideBoard(r, c)) { 
        const target = board[r][c];
        
        if ((`${r}-${c}` === gameState.enPassantTarget ) || (dc === 0 && !target) || (dc !== 0 && (target && target[1] !== piece[1]))) {
          moves.push(`${r}-${c}`);
        }
      }
    } else if (isInsideBoard(r, c)) {
      const target = board[r][c];

      if (!target || target[1] !== piece[1]) {
        moves.push(`${r}-${c}`);
      }
    }
  }

  if (piece === 'kw') {
    if (gameState.whiteKingSide && !board[7][6] && !board[7][5]) {
      moves.push('7-6')
    } 
    if (gameState.whiteQueenSide && !board[7][3] && !board[7][2] && !board[7][1]) {
      moves.push('7-2')
    }
  } else if (piece === 'kb') {
    if (gameState.blackKingSide && !board[0][6] && !board[0][5]) {
      moves.push('0-6')
    } 
    if (gameState.blackKingSide && !board[0][3] && !board[0][2] && !board[0][1] ) {
      moves.push('0-2')
    }
  }

  return moves;
}

export function updateCastlingRight(square, gameState, piece) {
  if (piece === 'kw') {
    gameState.whiteKingSide = false
    gameState.whiteQueenSide = false
  } else if (piece === 'kb') {
    gameState.blackKingSide = false
    gameState.blackQueenSide = false
  } else if (piece[0] === 'r') {
    if (square === '7-7') {
      gameState.whiteKingSide = false
    } else if (square === '7-0') {
      gameState.whiteQueenSide = false
    } else if (square === '0-7') {
      gameState.blackKingSide = false
    } else if (square === '0-0') {
      gameState.blackQueenSide = false
    }
  }

  return gameState
}

export function isSquareAttacked(board, square, gameState) {
  const opposite = {
    w: 'b',
    b: 'w'
  };

  const attackerPieces = board.flatMap((row, rowIndex) =>
    row.flatMap((item, colIndex) =>
      item !== null && item[1] !== gameState.turn
        ? [{ value: item, row: rowIndex, col: colIndex }]
        : []
    )
  );

  const gameStateTemp = { ...gameState };
  gameStateTemp.turn = opposite[gameState.turn]

  for (const pieces of attackerPieces) {
    if (getPseudoLegalMove(board, pieces.row, pieces.col, gameStateTemp).includes(square)) {
      return true
    }
  } 

  return false
}

function isInCheck(board, gameState) {
  const kingPiece = board.flatMap((row, rowIndex) =>
    row.flatMap((item, colIndex) =>
      item?.[0] === 'k' && item?.[1] === gameState.turn 
        ? [{ value: item, row: rowIndex, col: colIndex }]
        : []
    )
  );

  const kingPieceId = `${kingPiece[0].row}-${kingPiece[0].col}`
  return isSquareAttacked(board, kingPieceId, gameState)
}

export function applyMove(board, square, targetSquare) {
  const newBoard = structuredClone(board);
  const focusedPieceVal = square !== null ? getPiece(newBoard, Number(square[0]), Number(square[2])) : null 

  newBoard[Number(targetSquare[0])][Number(targetSquare[2])] = focusedPieceVal;
  newBoard[Number(square[0])][Number(square[2])] = null;

  return newBoard
}

export function isCheckmate(board, gameState) { 
  const pieces = board.flatMap((row, rowIndex) =>
    row.flatMap((item, colIndex) =>
      item !== null && item[1] === gameState.turn
        ? [{ value: item, row: rowIndex, col: colIndex }]
        : []
    )
  );

  if(!isInCheck(board, gameState)) return false
  return pieces.every(piece =>
    getLegalMoves(board, piece.row, piece.col, gameState).length === 0
  ) 
}

export function isStalemate(board, gameState) { 
  const pieces = board.flatMap((row, rowIndex) =>
    row.flatMap((item, colIndex) =>
      item !== null && item[1] === gameState.turn
        ? [{ value: item, row: rowIndex, col: colIndex }]
        : []
    )
  );

  if(isInCheck(board, gameState)) return false
  return pieces.every(piece =>
    getLegalMoves(board, piece.row, piece.col, gameState).length === 0
  ) 
}

export function pawnPromote(board, gameState, setOpen) {
  const turnToRow = {
    w: '0',
    b: '7'
  };

  for (const square of board[turnToRow[gameState.turn]]) {
    if (square && square[0] === 'p') {
      setOpen(true)
    }
  } 
}
