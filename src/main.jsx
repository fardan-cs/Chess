import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Board from './board'

createRoot(document.getElementById('board')).render(
  <Board />
)