import { StrictMode, useState, useRef, useEffect } from 'react'
import { getLegalMoves, updateCastlingRight, getPiece, isCheckmate, isStalemate, pawnPromote} from './moveHandler';
import useClickOutside from './clickOutside';

function Square({sqcolor, id, boardState, setBoardState, gameState, setGameState, setStalemate, setWinner, legalMoves, setLegalMoves, focusedPiece, setFocusedPiece, moveMode, setMoveMode, piece}) {
  const squareHasPiece = piece !== null
  const isFocusedNull = focusedPiece === null
  const pieceImage = !squareHasPiece ?  null : (<img src={`/src/assets/pieces/${piece}.svg`} className='absolute w-full h-full' />)
  const finalcolor = focusedPiece === id ? '#F5F682' : sqcolor
  const moveIndicator = moveMode && legalMoves.includes(id) && !squareHasPiece ? (
    <div className={'rounded-full bg-gray-600/50 w-[35%] h-[35%]'}></div>
  ) : moveMode && legalMoves.includes(id) && squareHasPiece ? (
    <div className="rounded-full w-[100%] h-[100%] border-[0.4vw] border-gray-600/50 bg-transparent"></div>
  ) : null
  const focusedPieceRow = !isFocusedNull ? focusedPiece[0] : null  
  const focusedPieceCol = !isFocusedNull ? focusedPiece[2] : null 

  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => {
    setIsOpen(false);
    return
  });

  const opposite = {
    w: 'b',
    b: 'w'
  };

  const promotionPieces = [
    { img: "q", alt: "Queen" },
    { img: "n", alt: "Knight" },
    { img: "r", alt: "Rook" },
    { img: "b", alt: "Bishop" }
  ];

  const promotionPiecesRender = gameState.turn === 'w'
      ? [...promotionPieces].reverse()
      : promotionPieces;
  
  function setPromotePawn(board, id, piece, color, setBoardState, setIsOpen) {
    const row = Number(id[0])
    const col = Number(id[2])
    const newBoard = structuredClone(board)

    newBoard[row][col] = `${piece}${color}`
    setBoardState(newBoard)
    setIsOpen(false)
  }

  function findLegalMove(piece, gameState) {
    const boardTemp = structuredClone(boardState)
    const gameStateTemp = {...gameState}
    setLegalMoves(getLegalMoves(boardTemp, Number(piece[0]), Number(piece[2]), gameStateTemp))
  }

  function handleMove() {
    const focusedPieceVal = !isFocusedNull ? getPiece(boardState, focusedPieceRow, focusedPieceCol) : null 
    const targetSquare = focusedPiece === id ? null : id;
    const stateToWinner = {
      w: 'White',
      b: 'Black'
    };

    if (!squareHasPiece) {
      if (legalMoves.includes(id)) {
        const newBoard = [...boardState];
        let gameStateTemp = {...gameState}

        if (focusedPieceVal === 'kw' && focusedPiece === '7-4' && id === '7-6') {
          newBoard[7][5] = 'rw';
          newBoard[7][7] = null;
        } else if (focusedPieceVal === 'kw' && focusedPiece === '7-4' && id === '7-2') {
          newBoard[7][3] = 'rw';
          newBoard[7][0] = null;
        } else if (focusedPieceVal === 'kb' && focusedPiece === '0-4' && id === '0-6') {
          newBoard[0][5] = 'rb';
          newBoard[0][7] = null;
        } else if (focusedPieceVal === 'kb' && focusedPiece === '0-4' && id === '0-2') {
          newBoard[0][3] = 'rb';
          newBoard[0][0] = null;
        }

        if (focusedPieceVal[0] === 'p' && Math.abs(Number(targetSquare[0]) - Number(focusedPiece[0]))  === 2) {
          gameStateTemp.enPassantTarget = `${(Number(targetSquare[0]) + Number(focusedPiece[0])) / 2}-${targetSquare[2]}`
        } else if (targetSquare === gameState.enPassantTarget) {
          null
        } else {
          gameStateTemp.enPassantTarget = null
        }

        if (focusedPieceVal[0] === 'p' && gameState.enPassantTarget) {
          const capturedRow = focusedPiece[0]
          const capturedCol = targetSquare[2]
          newBoard[capturedRow][capturedCol] = null
        }

        newBoard[id[0]][id[2]] = focusedPieceVal;
        newBoard[focusedPieceRow][focusedPieceCol] = null;
        gameStateTemp.turn = opposite[focusedPieceVal[1]]
        gameStateTemp = updateCastlingRight(focusedPiece, gameStateTemp, focusedPieceVal)

        pawnPromote(newBoard, gameState, setIsOpen)
        setBoardState(newBoard);
        setGameState(gameStateTemp)
        if (isCheckmate(newBoard, gameStateTemp)) {
          setWinner(stateToWinner[opposite[gameStateTemp.turn]])
        }
        if (isStalemate(newBoard, gameStateTemp)) {
          setStalemate(true)
        }
      }

      setMoveMode(false)     
      setFocusedPiece(null)

    } else {
      if (focusedPieceVal === null) {
        setFocusedPiece(targetSquare);
        targetSquare !== null ? findLegalMove(targetSquare, gameState) : null
        setMoveMode(targetSquare !== null);
      } else if (piece[1] === gameState.turn) {
        setFocusedPiece(targetSquare);
        findLegalMove(targetSquare, gameState)
        setMoveMode(true);
      } else {
        if (legalMoves.includes(id)) {
          const newBoard = structuredClone(boardState);
          let gameStateTemp = {...gameState}

          newBoard[id[0]][id[2]] = focusedPieceVal;
          newBoard[focusedPieceRow][focusedPieceCol] = null;
          gameStateTemp.turn = opposite[focusedPieceVal[1]]
          gameStateTemp = updateCastlingRight(focusedPiece, gameStateTemp, focusedPieceVal)
          gameStateTemp.enPassantTarget = null

          pawnPromote(newBoard, gameState, setIsOpen)
          setBoardState(newBoard);
          setGameState(gameStateTemp)
          setMoveMode(false)     
          setFocusedPiece(null)
          if (isCheckmate(newBoard, gameStateTemp)) {
            setWinner(stateToWinner[opposite[gameStateTemp.turn]])
          }
          if (isStalemate(newBoard, gameStateTemp)) {
            setStalemate(true)
          }
        } else {
          setFocusedPiece(targetSquare)
          setMoveMode(false)
        }
      }
    }
  }

  return (  
    <div
      style={{ backgroundColor: finalcolor}}
      className={`square aspect-square select-none flex justify-center items-center relative`}
      onClick={() => handleMove()}
    >
      {pieceImage}
      {moveIndicator}
      {(isOpen && (id[0] === '0' || id[0] === '7')) && (
        <div ref={ref} className={"absolute left-0 z-50 mt-0 w-full rounded-lg border bg-white shadow-lg" + (id[0] === '7' ? ' bottom-0' : ' top-0')}>
          {promotionPiecesRender.map(piece => (
            <button onClick={() => setPromotePawn(boardState, id, piece.img, opposite[gameState.turn], setBoardState, setIsOpen)} className="relative w-full px-1 py-1 text-left hover:bg-gray-100" key={piece.img}>
              <img src={`/src/assets/pieces/${piece.img}${opposite[gameState.turn]}.svg`} alt={piece.alt} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const colors = ["#E1E5CD", "#7B9D69", "#E1E5CD", "#7B9D69", "#E1E5CD", "#7B9D69", "#E1E5CD", "#7B9D69", "#7B9D69", "#E1E5CD", "#7B9D69", "#E1E5CD", "#7B9D69", "#E1E5CD", "#7B9D69", "#E1E5CD"]

function Board({setWinnerModal, stalemateModal, setStalemateModal}) {
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveMode, setMoveMode] = useState(false);
  const [focusedPiece, setFocusedPiece] = useState(null);
  const parentRef = useRef(null);

  const [boardState, setBoardState] = useState([
    ['rb', 'nb', 'bb', 'qb', 'kb', 'bb', 'nb', 'rb'],
    ['pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb'],
    [null, null, null, null, null, null, null ,null],
    [null, null, null, null, null, null, null ,null],
    [null, null, null, null, null, null, null ,null],
    [null, null, null, null, null, null, null ,null],
    ['pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw'],
    ['rw', 'nw', 'bw', 'qw', 'kw', 'bw', 'nw', 'rw'],
  ])

  const [gameState, setGameState] = useState({
    turn: 'w',
    whiteKingSide: true,
    whiteQueenSide: true,
    blackKingSide: true,
    blackQueenSide: true,
    enPassantTarget: null,
  })

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        parentRef.current &&
        !parentRef.current.contains(event.target)
      ) {
        setFocusedPiece(null);
        setMoveMode(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div id='board' className='grid grid-cols-8 w-[45vw] h-[45vw] border-solid border-[10px] border-[#262522]' ref={parentRef}>
      {boardState.map((row, rowIndex) => (
        row.map((piece, colIndex) => (
          <Square key={`${rowIndex}-${colIndex}`} sqcolor={colors[(((rowIndex) * 8) + colIndex) % 16]} id={`${rowIndex}-${colIndex}`} boardState={boardState} setBoardState={setBoardState} setStalemate={setStalemateModal} setWinner={setWinnerModal} gameState={gameState} setGameState={setGameState} legalMoves={legalMoves} setLegalMoves={setLegalMoves} focusedPiece={focusedPiece} setFocusedPiece={setFocusedPiece} moveMode={moveMode} setMoveMode={setMoveMode} piece={piece} />
        ))
      ))
      }
    </div>
  )
}

export default Board 