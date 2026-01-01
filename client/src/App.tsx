import { useGame } from './contexts/GameContext';
import { JoinScreen } from './screens/JoinScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { AnsweringScreen } from './screens/AnsweringScreen';
import { VotingScreen } from './screens/VotingScreen';
import { RevealScreen } from './screens/RevealScreen';
import { ScoreboardScreen } from './screens/ScoreboardScreen';
import { GameOverScreen } from './screens/GameOverScreen';

function App() {
  const { gameState } = useGame();

  switch (gameState) {
    case 'idle':
      return <JoinScreen />;
    case 'lobby':
      return <LobbyScreen />;
    case 'answering':
      return <AnsweringScreen />;
    case 'voting':
      return <VotingScreen />;
    case 'revealing':
      return <RevealScreen />;
    case 'scoreboard':
      return <ScoreboardScreen />;
    case 'gameOver':
      return <GameOverScreen />;
    default:
      return <JoinScreen />;
  }
}

export default App;
