import { motion } from 'framer-motion';
import { Check, Send } from 'lucide-react';
import { Button } from '../components/Button';
import { Timer } from '../components/Timer';
import { useGame } from '../contexts/GameContext';

export function VotingScreen() {
  const {
    prompt,
    timeLimit,
    answers,
    player,
    players,
    selectedVotes,
    toggleVote,
    submitVotes,
    hasVoted,
    votedCount
  } = useGame();

  // Filter out own answer
  const otherAnswers = answers.filter(a => a.playerId !== player?.id);

  if (hasVoted) {
    return (
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Check size={40} className="text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold mb-2">Votes Submitted!</h2>
        <p className="text-slate-400 mb-8">Waiting for others...</p>

        <div className="bg-slate-800 rounded-xl px-6 py-3">
          <span className="text-slate-400">{votedCount}</span>
          <span className="text-slate-600"> / </span>
          <span className="text-white">{players.length}</span>
          <span className="text-slate-400 ml-2">voted</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Which are LIES?</h2>
        <Timer seconds={timeLimit} />
      </div>

      {/* Prompt reminder */}
      <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
        <p className="text-sm text-slate-400 mb-1">The prompt was:</p>
        <p className="font-medium">{prompt}</p>
      </div>

      {/* Answer cards */}
      <div className="flex-1 space-y-3 mb-6 overflow-y-auto">
        {otherAnswers.map((answer, index) => {
          const isSelected = selectedVotes.includes(answer.playerId);

          return (
            <motion.button
              key={answer.playerId}
              onClick={() => toggleVote(answer.playerId)}
              className={`
                w-full text-left p-4 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'bg-red-500/20 border-red-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-400 mb-1">
                    {answer.playerName}
                  </p>
                  <p className="text-white">{answer.answer}</p>
                </div>

                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                  ${isSelected
                    ? 'bg-red-500 border-red-500'
                    : 'border-slate-600'
                  }
                `}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  className="mt-2 text-xs text-red-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Marked as LIE
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit button */}
      <Button fullWidth size="lg" onClick={submitVotes}>
        <Send size={20} />
        Submit Votes ({selectedVotes.length} marked as lies)
      </Button>

      {/* Progress */}
      <div className="text-center text-sm text-slate-400 mt-4">
        {votedCount} / {players.length} players voted
      </div>
    </motion.div>
  );
}
