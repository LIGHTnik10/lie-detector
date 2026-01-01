import { motion } from 'framer-motion';
import { Trophy, Medal, Star, RotateCcw, Home } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../contexts/GameContext';

export function GameOverScreen() {
  const {
    player,
    players,
    playAgain,
    returnToLobby
  } = useGame();

  const isHost = player?.isHost;
  const winner = players[0];
  const isMeWinner = winner?.id === player?.id;
  const myRank = players.findIndex(p => p.id === player?.id) + 1;

  const getPodiumIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={32} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={32} className="text-slate-400" />;
    if (rank === 3) return <Medal size={32} className="text-amber-700" />;
    return null;
  };

  const getPodiumClass = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-500/10 border-yellow-500/50';
    if (rank === 2) return 'from-slate-500/20 to-slate-500/10 border-slate-500/50';
    if (rank === 3) return 'from-amber-700/20 to-amber-700/10 border-amber-700/50';
    return 'bg-slate-800/50 border-slate-700';
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center py-8">
        {isMeWinner && (
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <Trophy size={80} className="text-yellow-500" />
          </motion.div>
        )}

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {isMeWinner ? '🎉 You Won! 🎉' : 'Game Over'}
        </motion.h1>

        {isMeWinner ? (
          <motion.p
            className="text-xl text-yellow-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            You are the master of deception!
          </motion.p>
        ) : (
          <motion.p
            className="text-lg text-slate-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {winner?.name} wins!
          </motion.p>
        )}
      </div>

      {/* Your rank */}
      <motion.div
        className="max-w-md mx-auto w-full mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className={`
          bg-gradient-to-r rounded-2xl p-6 text-center
          ${myRank === 1 ? 'from-yellow-500/20 to-yellow-500/10 border-2 border-yellow-500/50' : 
            myRank === 2 ? 'from-slate-500/20 to-slate-500/10 border-2 border-slate-500/50' :
            myRank === 3 ? 'from-amber-700/20 to-amber-700/10 border-2 border-amber-700/50' :
            'bg-slate-800/50 border-2 border-slate-700'}
        `}>
          <p className="text-sm text-slate-400 mb-2">Your final rank</p>
          <div className="flex items-center justify-center gap-3">
            {getPodiumIcon(myRank)}
            <p className="text-4xl font-bold text-white">
              #{myRank}
            </p>
          </div>
          {player && (
            <p className="text-2xl font-semibold mt-2 text-indigo-400">
              {player.score} points
            </p>
          )}
        </div>
      </motion.div>

      {/* Final leaderboard */}
      <div className="flex-1 max-w-lg mx-auto w-full mb-6 overflow-y-auto">
        <h2 className="text-center text-slate-400 mb-4">Final Rankings</h2>
        <div className="space-y-3">
          {players.map((p, index) => {
            const rank = index + 1;
            const isMe = p.id === player?.id;

            return (
              <motion.div
                key={p.id}
                className={`
                  relative p-4 rounded-xl border-2
                  ${rank <= 3
                    ? `bg-gradient-to-r ${getPodiumClass(rank)}`
                    : 'bg-slate-800/50 border-slate-700'
                  }
                  ${isMe ? 'ring-2 ring-indigo-500' : ''}
                `}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${rank <= 3 ? 'bg-white/10' : 'bg-slate-700'}
                    `}>
                      {rank <= 3 ? getPodiumIcon(rank) : (
                        <span className="text-slate-400 font-bold">{rank}</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                        {p.name}
                        {isMe && ' (you)'}
                      </p>
                      {rank <= 3 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(3 - rank + 1)].map((_, i) => (
                            <Star key={i} size={12} className="text-yellow-500 fill-yellow-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-400">
                      {p.score}
                    </p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="max-w-lg mx-auto w-full pt-6 space-y-3">
        {isHost ? (
          <>
            <Button
              fullWidth
              size="lg"
              onClick={playAgain}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <RotateCcw size={20} />
              Play Again
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={returnToLobby}
            >
              <Home size={20} />
              Return to Lobby
            </Button>
          </>
        ) : (
          <div className="text-center text-slate-400">
            Waiting for host to choose next game...
          </div>
        )}
      </div>
    </motion.div>
  );
}
