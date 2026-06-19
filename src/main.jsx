import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import Board from './board'
import Modal from './modal'

function App() {
  const [winnerModal, setWinnerModal] = useState('Black');
  const [stalemate, setStalemate] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(open => !open)
  }, [winnerModal])

  useEffect(() => {
    setOpen(open => !open)
  }, [stalemate])

  return (
    <>
    <Board setWinnerModal={setWinnerModal} stalemateModal={stalemate} setStalemateModal={setStalemate}/>
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title={!stalemate ? "Checkmate!" : "Stalemate!"}
      size="md"           
      closeOnBackdrop     
      showCloseButton     
    >
      {!stalemate ? <p>{winnerModal} Wins The Game</p> : <p>Stalemate!</p>}
      </Modal>
    </>
  )
}

createRoot(document.getElementById('board')).render(
  <App />
)