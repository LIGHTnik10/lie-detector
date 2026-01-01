import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../contexts/GameContext';

export function JoinScreen() {
  const { createRoom, joinRoom, error, clearError } = useGame();
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      createRoom(playerName.trim());
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      joinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (mode === 'select') {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Lie Detector
          </h1>
          <p className="text-slate-400 text-lg">Truth or Deception?</p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              fullWidth
              size="lg"
              onClick={() => setMode('create')}
              className="h-20"
            >
              <Sparkles size={24} />
              <span>Host a Game</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={() => setMode('join')}
              className="h-20"
            >
              <Users size={24} />
              <span>Join a Game</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-sm"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <button
          onClick={() => { setMode('select'); clearError(); }}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <h2 className="text-3xl font-bold mb-8">
          {mode === 'create' ? 'Host a Game' : 'Join a Game'}
        </h2>

        <form onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          {mode === 'join' && (
            <div className="mb-4">
              <label className="block text-slate-400 text-sm mb-2">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                placeholder="ABCD"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-slate-400 text-sm mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              autoFocus={mode === 'create'}
            />
          </div>

          {error && (
            <motion.div
              className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!playerName.trim() || (mode === 'join' && roomCode.length !== 4)}
          >
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
