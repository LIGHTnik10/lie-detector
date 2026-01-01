import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GameProvider } from './contexts/GameContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>,
)
