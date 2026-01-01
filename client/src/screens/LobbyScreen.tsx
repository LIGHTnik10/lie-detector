import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Button } from '../components/Button';
import { RoomCode } from '../components/RoomCode';
import { PlayerList } from '../components/PlayerList';
import { useGame } from '../contexts/GameContext';

export function LobbyScreen() {
  const { roomCode, player, players, startGame, error } = useGame();
  const isHost = player?.isHost;
  const canStart = players.length >= 3;

  return (
    <motion.div
      className="min-h-screen flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header with room code */}
      <div className="text-center py-8">
        <RoomCode code={roomCode || ''} />
        <p className="text-slate-400 mt-4">
          Share this code with your friends
        </p>
      </div>

      {/* Players list */}
      <div className="flex-1 max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-slate-400" />
          <span className="text-slate-400">
            Players ({players.length}/8)
          </span>
        </div>

        <PlayerList players={players} highlightId={player?.id} />

        {players.length < 3 && (
          <motion.p
            className="text-center text-amber-400 mt-4 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Need at least 3 players to start
          </motion.p>
        )}
      </div>

      {/* Actions */}
      <div className="max-w-md mx-auto w-full pt-6">
        {error && (
          <motion.div
            className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {isHost ? (
          <Button
            fullWidth
            size="lg"
            onClick={startGame}
            disabled={!canStart}
          >
            Start Game
          </Button>
        ) : (
          <div className="text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-xl text-slate-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              Waiting for host to start...
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
