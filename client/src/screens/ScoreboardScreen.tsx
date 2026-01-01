import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '../components/Button';
import { useGame } from '../contexts/GameContext';

export function ScoreboardScreen() {
  const {
    player,
    players,
    roundScores,
    currentRound,
    maxRounds,
    nextRound
  } = useGame();

  const isHost = player?.isHost;
  const myRoundScore = roundScores[player?.id || ''] || 0;
  const isFinalRound = currentRound >= maxRounds;

  return (
    <motion.div
      className="min-h-screen flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-block mb-4"
        >
          <Trophy size={64} className="text-yellow-500" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Round {currentRound} Results
        </h1>
        {isFinalRound ? (
          <p className="text-slate-400">Final Scores</p>
        ) : (
          <p className="text-slate-400">Round {currentRound} of {maxRounds}</p>
        )}
      </div>

      {/* Your score card */}
      <motion.div
        className="max-w-lg mx-auto w-full mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-slate-800/50 rounded-2xl p-6">
          <p className="text-sm text-slate-400 mb-2">Your round score</p>
          <div className="flex items-center gap-3">
            <p className={`text-4xl font-bold ${myRoundScore > 0 ? 'text-emerald-400' : myRoundScore < 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {myRoundScore > 0 ? '+' : ''}{myRoundScore}
            </p>
            {myRoundScore > 0 && <TrendingUp size={24} className="text-emerald-400" />}
            {myRoundScore < 0 && <TrendingDown size={24} className="text-red-400" />}
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <div className="flex-1 max-w-lg mx-auto w-full mb-6 overflow-y-auto">
        <div className="space-y-3">
          {players.map((p, index) => {
            const roundScore = roundScores[p.id] || 0;
            const isMe = p.id === player?.id;
            const isTop = index === 0;

            return (
              <motion.div
                key={p.id}
                className={`
                  relative p-4 rounded-xl border-2 transition-all
                  ${isMe
                    ? 'bg-indigo-500/20 border-indigo-500'
                    : 'bg-slate-800/50 border-slate-700'
                  }
                  ${isTop && !isMe ? 'border-yellow-500/50' : ''}
                `}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {/* Rank */}
                {isTop && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Trophy size={18} className="text-white" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${index < 3 ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-400'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                        {p.name}
                        {isMe && ' (you)'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {roundScore > 0 ? '+' : ''}{roundScore} this round
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`text-2xl font-bold ${p.score > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {p.score}
                    </p>
                    <p className="text-xs text-slate-500">total</p>
                  </div>
                </div>

                {/* Score change animation */}
                {roundScore !== 0 && (
                  <motion.div
                    className={`
                      absolute top-1/2 right-16 -translate-y-1/2
                      ${roundScore > 0 ? 'text-emerald-400' : 'text-red-400'}
                    `}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {roundScore > 0 ? '+' : ''}{roundScore}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      {isHost && (
        <div className="max-w-lg mx-auto w-full pt-6">
          <Button
            fullWidth
            size="lg"
            onClick={nextRound}
          >
            {isFinalRound ? 'Show Final Results' : 'Next Round'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
